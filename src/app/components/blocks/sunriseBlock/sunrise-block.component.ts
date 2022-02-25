import {Component, OnInit} from '@angular/core'
import {DomoticzService} from 'src/app/domoticz.service'
import {BehaviorSubject} from 'rxjs'
import {DomoticzData} from 'src/app/api.types'

@Component({
  selector: 'app-sunrise-block',
  templateUrl: './sunrise-block.component.html',
  styleUrls: ['./sunrise-block.component.scss'],
})
export class SunriseBlockComponent implements OnInit {

  data: DomoticzData | undefined = undefined
  private subject: BehaviorSubject<DomoticzData | undefined> = new BehaviorSubject<DomoticzData | undefined>(undefined)

  constructor(private domoticzService: DomoticzService) {
    this.subject.subscribe((value) => {
      if (value) {
        this.data = value
      }
    })
  }

  ngOnInit() {
    const data = this.domoticzService.getSunrise()
    if (data) {
      this.data = data
    }
    this.domoticzService.registerSunriseSubject(this.subject)
  }


}
