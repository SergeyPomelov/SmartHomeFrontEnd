import {DOCUMENT} from '@angular/common'
import {Inject, Injectable} from '@angular/core'
import {BehaviorSubject} from 'rxjs'
import {WebSocketSubject} from 'rxjs/internal-compatibility'
import {retry} from 'rxjs/operators'
import {webSocket} from 'rxjs/webSocket'
import {DomoticzWSRequest} from 'src/app/api.types'
import {environment} from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {

  wsOpen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  subject: WebSocketSubject<any> | undefined

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.connect()
    const visibilityChangedCallback = function(wsOpen: BehaviorSubject<boolean>) {
      if (!document.hidden && !wsOpen.value) {
        window.location.reload()
      }
    }
    document.addEventListener('visibilitychange', visibilityChangedCallback.bind(document, this.wsOpen), false)
  }

  public connect() {
    console.log('Websocket connection.')
    this.subject = webSocket({
      url: `wss://${environment.apiUrl}/json`,
      protocol: 'domoticz',
      openObserver: {
        next: () => {
          this.wsOpen.next(true)
          console.log('Websocket started.')
        },
      },
      closeObserver: {
        next: () => {
          this.disconnect(false)
        },
      },
    })

    this.subject
    .pipe(retry())
    .subscribe(
      () => {},
      err => console.log('Websocket error.', err),
      () => console.log('Websocket complete.'),
    )
  }

  public send(msg: DomoticzWSRequest) {
    this.subject?.next(msg)
  }

  public disconnect(gracefully = true) {
    this.subject?.complete()
    this.wsOpen.next(false)
    if (!gracefully) {
      console.log('Websocket unexpected disconnected.')
      this.subject?.error('unexpected disconnect')
    } else {
      console.log('Websocket disconnected.')
      this.wsOpen.complete()
      this.subject?.unsubscribe()
      this.wsOpen.unsubscribe()
    }
  }
}
