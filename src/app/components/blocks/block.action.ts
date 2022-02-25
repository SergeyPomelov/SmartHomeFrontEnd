import {Observable} from 'rxjs'
import {tap} from 'rxjs/operators'
import {DomoticzData} from 'src/app/api.types'

export function action(idx: number, responseAsync: Observable<DomoticzData>,
                       updateSupposingSuccessFn: () => void = () => {},
) {
  updateSupposingSuccessFn()
  responseAsync.pipe(tap(response => {
    if (response.status === 'OK') {
      updateSupposingSuccessFn()
    } else {
      console.error(idx + ' ' + response.title + ' ' + response.message + ' ' + response.status)
    }
  }))
}
