import {HttpClient, HttpEvent, HttpEventType} from '@angular/common/http'
import {Injectable} from '@angular/core'
import {Observable} from 'rxjs'
import {filter, map} from 'rxjs/operators'
import {Device, DomoticzData} from 'src/app/api.types'

@Injectable({
  providedIn: 'root',
})
export class DevicesStreamLoader {

  constructor(private http: HttpClient) { }

  loadDevices(observable: Observable<HttpEvent<DomoticzData>>, updateDevice: (device: Device) => void): void {
    let handled = 0

    let resultStart = false
    let resultEnd = false
    let ignoreNextSquareBracketEnd = false

    observable
    .pipe(
      filter((e: any) => {
        // console.log(e)
        return e.type === HttpEventType.DownloadProgress && e.partialText
      }),
      map(e => e.partialText.replaceAll('\t', '').trim().split('\n')))
    .subscribe((arr: string[]) => {
      let entityStart = false
      let entityEnd = false
      let ignoreNextEntityBracketEnd = false

      let entity: string[] = []
      for (let i = handled; i < arr.length; i++) {

        // console.log(arr[i])
        if (arr[i].indexOf('result') >= 0) {
          resultStart = true
          //console.log('resultStart')
        }

        if (arr[i].indexOf('[') >= 0) {
          ignoreNextSquareBracketEnd = true
        }
        if (arr[i].indexOf(']') >= 0) {
          if (ignoreNextSquareBracketEnd) {
            ignoreNextSquareBracketEnd = false
          } else {
            resultEnd = true
            //console.log('resultEnd')
          }
        }

        if (!resultStart || resultEnd) {
          handled = i + 1
          continue
        }

        if (arr[i].indexOf('{') >= 0) {
          // console.log('entityStart')
          if (entityStart) {
            ignoreNextEntityBracketEnd = true
          }
          entityStart = true
          entityEnd = false
          ignoreNextEntityBracketEnd = false
        }
        if (entityStart && !entityEnd) {
          entity.push(arr[i])
        }
        if (entityStart && arr[i].indexOf('},') >= 0) {
          if (ignoreNextEntityBracketEnd) {
            ignoreNextEntityBracketEnd = false
          } else {
            entityEnd = true
            const deviceJson = entity.join('\n').replace('},', '}')
            // console.log('entity ' + deviceJson)
            try {
              const device: Device = JSON.parse(deviceJson)
              // console.log(device)
              updateDevice(device)
            } catch (e) {
              console.error(deviceJson, e)
            } finally {
              entity.length = 0
              handled = i + 1
            }
          }
        }
      }
    })
  }
}
