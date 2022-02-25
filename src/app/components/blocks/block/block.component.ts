import {Component, Input, OnInit} from '@angular/core'
import {BehaviorSubject} from 'rxjs'
import {Device, SwitchLevel} from 'src/app/api.types'
import {action} from 'src/app/components/blocks/block.action'
import {
  DEFAULT_BLOCK_CLASS,
  DEFAULT_ICON,
  DEFAULT_ICON_CLASS,
  DEFAULT_TITLE,
} from 'src/app/components/blocks/block.constants'
import {DomoticzService} from 'src/app/domoticz.service'
import {getData} from './device.data'
import {getIconClass} from './device.icon'


@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss'],
})
export class BlockComponent implements OnInit {

  @Input() idx: number | undefined
  @Input() title = DEFAULT_TITLE
  @Input() icon = DEFAULT_ICON
  @Input() clickable = false
  @Input() refreshSec = 60000
  @Input() dataIsUpdateTime = false
  @Input() hideOffLevel = true

  private subject: BehaviorSubject<Device | undefined> = new BehaviorSubject<Device | undefined>(undefined)

  device: Device | undefined = undefined
  data: string | undefined = undefined
  blockClass = DEFAULT_BLOCK_CLASS
  iconClass = DEFAULT_ICON_CLASS

  options: SwitchLevel[] = []
  selectedOption: SwitchLevel | undefined = undefined

  constructor(private domoticzService: DomoticzService) {
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
    return getIconClass(this.device, this.icon)
  }

  getData(): string | undefined {
    return getData(this.device, this.dataIsUpdateTime)
  }

  onClick(): void {
    // prevent defaults for elements without controls or with custom controls
    if (!this.idx || !this.clickable || this.device?.Type === 'Thermostat' || this.device?.SwitchType === 'Selector') return

    if (this.device && this.device.Status === 'On') {
      action(this.idx, this.domoticzService.offDevice(this.idx),
        () => {
          if (this.device && this.device.Status) {
            this.device.Status = 'Off'
          }
        })
    } else {
      action(this.idx, this.domoticzService.onDevice(this.idx),
        () => {
          if (this.device && this.device.Status) {
            this.device.Status = 'On'
          }
        })
    }
  }

  selected(switchLevel: SwitchLevel): void {
    if (!this.idx || !this.clickable) return
    this.selectedOption = switchLevel
    action(this.idx, this.domoticzService.setLevel(this.idx, this.selectedOption.level),
      () => {
        if (this.device && this.device.Level) {
          this.device.Level = switchLevel.level
        }
      })
  }

  upVariable(): void {
    if (!this.device || !this.device.SetPoint) return
    this.setSetPoint(parseFloat(this.device.SetPoint) + 0.1)
  }

  downVariable(): void {
    if (!this.device || !this.device.SetPoint) return
    this.setSetPoint(parseFloat(this.device.SetPoint) - 0.1)
  }

  setSetPoint(setPoint: number): void {
    if (!this.idx) return

    action(this.idx, this.domoticzService.setPoint(this.idx, setPoint),
      () => {
        if (this.device && this.device.Data) {
          this.device.Data = setPoint.toFixed(1)
        }
      })
  }

  private updateFromDevice(device: Device): void {
    this.device = device
    this.iconClass = this.getIconClass()
    this.blockClass = this.clickable ? 'block hover' : 'block'
    this.data = this.getData()
    if (this.title === DEFAULT_TITLE) {
      this.title = this.device.Name
    }
    if (this.device.SubType === 'Selector Switch' && this.device.LevelNames && this.device.Level != null) {
      let i = 0
      this.options = atob(this.device.LevelNames).split('|').map(levelName => {
        const level = {id: i, name: levelName, level: i * 10}
        i++
        return level
      })
      this.selectedOption = this.options[this.device.Level / 10]
    }
  }
}
