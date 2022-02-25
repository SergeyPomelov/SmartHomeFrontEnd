import {Component, Input, OnInit} from '@angular/core'
import {Device} from 'src/app/api.types'
import {DomoticzService} from 'src/app/domoticz.service'
import {
  DEFAULT_BLOCK_CLASS,
  DEFAULT_ICON,
  DEFAULT_ICON_CLASS,
  DEFAULT_TITLE,
} from 'src/app/components/blocks/block.constants'
import {action} from 'src/app/components/blocks/block.action'
import {BehaviorSubject} from 'rxjs'


@Component({
  selector: 'app-scene-block',
  templateUrl: './scene-block.component.html',
  styleUrls: ['./scene-block.component.scss'],
})
export class SceneBlockComponent implements OnInit {

  @Input() idx: number | undefined
  @Input() title = DEFAULT_TITLE
  @Input() icon = DEFAULT_ICON
  @Input() clickable = false

  private subject: BehaviorSubject<Device | undefined> = new BehaviorSubject<Device | undefined>(undefined)

  scene: Device | undefined = undefined
  blockClass = DEFAULT_BLOCK_CLASS
  iconClass = DEFAULT_ICON_CLASS

  constructor(private domoticzService: DomoticzService) {
    this.subject.subscribe((value) => {
      if (value) {
        this.updateFromDevice(value)
      }
    })
  }

  ngOnInit() {
    const scene = this.domoticzService.getScene(this.idx)
    if (scene) {
      this.updateFromDevice(scene)
    }
    this.domoticzService.registerSceneSubject(this.idx, this.subject)
  }

  getIconClass(): string {
    return 'fa fa-' + this.icon
  }

  onClick(): void {
    if (!this.idx || !this.clickable) return
    action(this.idx, this.domoticzService.activateScene(this.idx))
  }

  private updateFromDevice(scene: Device): void {
    this.scene = scene
    this.iconClass = this.getIconClass()
    this.blockClass = this.clickable ? 'block hover' : 'block'
    if (this.title === DEFAULT_TITLE) {
      this.title = this.scene.Name
    }
  }
}
