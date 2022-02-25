import {Component, Input, OnInit} from '@angular/core'
import {Device} from 'src/app/api.types'
import {DomoticzService} from 'src/app/domoticz.service'
import {BehaviorSubject} from 'rxjs'
import {
  DEFAULT_BLOCK_CLASS,
  DEFAULT_ICON,
  DEFAULT_ICON_CLASS,
  DEFAULT_TITLE,
  LIGHT_BULB_ICON,
} from 'src/app/components/blocks/block.constants'
import {ColorPickerService, Hsva, Rgba} from 'ngx-color-picker'
import {action} from 'src/app/components/blocks/block.action'


@Component({
  selector: 'app-color-switch-block',
  templateUrl: './color-switch-block.component.html',
  styleUrls: ['./color-switch-block.component.scss'],
})
export class ColorSwitchBlockComponent implements OnInit {

  @Input() idx: number | undefined
  @Input() title = DEFAULT_TITLE
  @Input() icon = DEFAULT_ICON
  @Input() clickable = false

  private subject: BehaviorSubject<Device | undefined> = new BehaviorSubject<Device | undefined>(undefined)

  device: Device | undefined = undefined

  blockClass = DEFAULT_BLOCK_CLASS
  iconClass = DEFAULT_ICON_CLASS

  pickerOpen = false
  cpPosition = 'auto'
  color = 'rgba(66,66,66,1)'
  colorHex = '#424242'

  constructor(private domoticzService: DomoticzService,
              private cpService: ColorPickerService) {
    this.subject.subscribe((value) => {
      if (value) {
        this.updateFromDevice(value)
      }
    })
  }

  ngOnInit() {
    const device = this.domoticzService.getDevice(this.idx)
    if (device) {
      this.updateFromDevice(device)
    }
    this.domoticzService.registerDeviceSubject(this.idx, this.subject)
  }

  getIconClass(): string {
    const off = this.device?.Status === 'Off' || this.device?.Level === 0
    let addon = off ? ' icon-off' : ''
    if (this.icon === LIGHT_BULB_ICON) {
      addon += off ? ' far' : ' fas'
      return 'fa-' + this.icon + addon
    }
    return 'fa fa-' + this.icon + addon
  }

  onClick(): void {

    if (!this.idx || !this.clickable) return

    action(this.idx, this.domoticzService.toggleDevice(this.idx),
      () => {
        if (this.device && this.device.Status) {
          if (this.device.Status === 'On') {
            this.device.Status = 'Off'
          } else {
            this.device.Status = 'On'
          }
        }
      })
  }

  public onColorChoiceStart(): void {
    this.pickerOpen = true
  }

  public onColorChoice(color: string): void {
    if (!this.idx) return
    this.pickerOpen = false
    const colorHsva = this.cpService.stringToHsva(color)
    const colorRgba = this.cpService.hsvaToRgba(colorHsva as Hsva)
    const colorHex = this.cpService.rgbaToHex(new Rgba(colorRgba.r * 255, colorRgba.g * 255, colorRgba.b * 255, colorRgba.a))

    action(this.idx, this.domoticzService.setColor(this.idx, colorHex.replace('#', ''), Math.floor(colorRgba.a * 100)),
      () => {
        if (this.device && this.device.Status) {
          this.device.Status = 'On'
        }
      })
  }

  private updateFromDevice(device: Device): void {
    this.device = device
    this.iconClass = this.getIconClass()
    this.blockClass = this.clickable ? 'block hover' : 'block'
    if (device.Color && device.Level && !this.pickerOpen) {
      this.color = this.domoticzService.toRgba(device.Color, device.Level)
      const colorHsva = this.cpService.stringToHsva(this.color)
      const colorRgba = this.cpService.hsvaToRgba(colorHsva as Hsva)
      this.colorHex = this.cpService.rgbaToHex(new Rgba(colorRgba.r * 255, colorRgba.g * 255, colorRgba.b * 255, 1))
    }
    if (this.title === DEFAULT_TITLE) {
      this.title = this.device.Name
    }
    if (this.title === 'Gateway') {
      this.cpPosition = 'bottom-left'
    }
  }
}
