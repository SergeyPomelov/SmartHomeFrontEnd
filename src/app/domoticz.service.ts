import {HttpClient, HttpEvent, HttpEventType} from '@angular/common/http'
import {Injectable, OnDestroy} from '@angular/core'
import {BehaviorSubject, Observable} from 'rxjs'
import {filter, finalize, tap} from 'rxjs/operators'
import {CookieService} from 'ngx-cookie-service'
import {Device, DomoticzData, DomoticzWSRequest, DomoticzWSResponse} from 'src/app/api.types'
import {DevicesStreamLoader} from 'src/app/devicesStreamLoader'
import {WebsocketService} from 'src/app/websocket.service'
import {environment} from 'src/environments/environment'

const API = `https://${environment.apiUrl}/json.htm?`
const API_COMMAND = API + 'type=command&'
const BACK_UNRESPONSIVE_LIMIT_MS = 300000
const DEVICES_STATE_KEY = 'devicesState'

@Injectable({
  providedIn: 'root',
})
export class DomoticzService implements OnDestroy {

  private readonly state: DomoticzData | null = null
  private isUpdating = false
  private gotWsInitialState = false
  private devices = new Map<number, Device>()
  private scenes = new Map<number, Device>()
  private sunrise: DomoticzData | undefined = undefined
  private loadDeviceHandler = -1
  private devicesSubjects = new Map<number, BehaviorSubject<Device | undefined>>()
  private sceneSubjects = new Map<number, BehaviorSubject<Device | undefined>>()
  private sunriseSubject = new BehaviorSubject<DomoticzData | undefined>(undefined)
  private lastUpdateTimestamp = Date.now()

  constructor(private http: HttpClient,
              private socket: WebsocketService,
              private cookie: CookieService,
              private devicesStreamLoader: DevicesStreamLoader) {

    const stateString = localStorage.getItem(DEVICES_STATE_KEY)
    if (stateString) {
      this.state = JSON.parse(stateString)
      if (this.state) {
        this.parseDevices(this.state)
        console.log('State loaded.')
      }
    }
  }

  initialize() {

    if (!this.state) {
      setTimeout(() => this.fetchState(), 100)
    } else {
      setTimeout(() => this.fetchState(), 500)
    }

    this.loadDeviceHandler = setInterval(() => this.loadDevices(), 60000)

    setTimeout(() => this.loadScenes(), 2000)
    setInterval(() => this.loadScenes(), 60000)

    this.socket.wsOpen.subscribe((value) => {
      if (value) {
        clearInterval(this.loadDeviceHandler)
        this.loadDeviceHandler = setInterval(() => this.loadDevices(), 60000)
        console.log('Devices update interval 1m.')
      } else if (this.gotWsInitialState) {
        clearInterval(this.loadDeviceHandler)
        this.loadDeviceHandler = setInterval(() => this.loadDevices(), 1000)
        console.log('Devices update interval 1s.')
      }
      this.gotWsInitialState = true
    })

    const request: DomoticzWSRequest = {
      event: 'request',
      query: 'type=devices',
      requestid: 0,
    }
    this.socket.send(request)
    this.socket.subject?.subscribe(
      msg => this.processWsMessage(msg),
    )
  }

  ngOnDestroy() {
    console.log('ngOnDestroy')
    clearInterval(this.loadDeviceHandler)
    this.socket.disconnect()
  }

  registerDeviceSubject(idx: number | undefined, subject: BehaviorSubject<Device | undefined>): void {
    if (idx && subject) {
      this.devicesSubjects.set(idx, subject)
    }
  }

  registerSceneSubject(idx: number | undefined, subject: BehaviorSubject<Device | undefined>): void {
    if (idx && subject) {
      this.sceneSubjects.set(idx, subject)
    }
  }

  registerSunriseSubject(subject: BehaviorSubject<DomoticzData | undefined>): void {
    if (subject) {
      this.sunriseSubject = subject
    }
  }

  loadDevices() {
    return this.http.get<DomoticzData>(`${API}type=devices&filter=all&used=true&displayhidden=0`)
    .subscribe((response: DomoticzData) => {
      if (response) {
        this.parseDevices(response)
        this.saveState(response)
      }
    })
  }

  private fetchState() {
    const observable: Observable<HttpEvent<DomoticzData>> = this.http.get<DomoticzData>(
      `${API}type=devices&filter=all&used=true&displayhidden=0&favorite=1`,
      {observe: 'events', reportProgress: true, responseType: 'text' as 'json'})
    this.isUpdating = true

    observable.pipe(
      filter((r: any) => {return r.type === HttpEventType.Response && r.body}),
      finalize(() => this.isUpdating = false),)
    .subscribe((r: any) => {
      this.parseDevices(JSON.parse(r.body))
      this.saveState(JSON.parse(r.body))
    })
    this.devicesStreamLoader.loadDevices(observable, this.updateDevice.bind(this))
    console.log('Fetching state')
  }

  private saveState(response: DomoticzData): void {
    this.cookie.set('devicesStateJsonVersion', `{version:1,timestamp:${Date.now()}}`, undefined, '/ui')
    localStorage.setItem(DEVICES_STATE_KEY, JSON.stringify(response))
  }

  private parseDevices(response: DomoticzData): void {
    // console.log(response)
    if (!response) {
      console.error("Bad Domoticz response.")
      console.error(response)
      return
    }
    if (response.Sunrise && response.Sunset) {
      this.sunrise = response
      this.sunriseSubject.next(this.sunrise)
    }
    if (response.result) {
      response.result.forEach(updatedDevice => {
        this.updateDevice(updatedDevice)
      })
      this.devices = new Map(response.result.map(device => [parseInt(device.idx, 10), device]))
      this.lastUpdateTimestamp = Date.now()
      this.isUpdating = false
    }
  }

  loadScenes(): void {
    this.http.get<DomoticzData>(`${API}type=scenes`).pipe(
      tap(
        (response: DomoticzData) => {
          if (response.result) {
            response.result.forEach(updatedScene => {
              this.updateScene(updatedScene)
            })
            this.scenes = new Map(response.result.map(scene => [parseInt(scene.idx, 10), scene]))
            this.lastUpdateTimestamp = Date.now()
          }
        }),
    ).subscribe()
  }

  getDevice(idx: number | undefined): Device | undefined {
    if (!idx) {
      return
    }
    return this.devices.get(idx)
  }

  getScene(idx: number | undefined): Device | undefined {
    if (!idx) {
      return
    }
    return this.scenes.get(idx)
  }

  getSunrise(): DomoticzData | undefined {
    return this.sunrise
  }

  onDevice(idx: number): Observable<DomoticzData> {
    return this.switchLight(idx, 'On')
  }

  offDevice(idx: number): Observable<DomoticzData> {
    return this.switchLight(idx, 'Off')
  }

  toggleDevice(idx: number): Observable<DomoticzData> {
    return this.switchLight(idx, 'Toggle')
  }

  activateScene(idx: number): Observable<DomoticzData> {
    return this.command(idx, 'switchscene', 'switchcmd=On')
  }

  setLevel(idx: number, level: number): Observable<DomoticzData> {
    return this.switchLight(idx, 'Set%20Level', `level=${level}`)
  }

  setPoint(idx: number, setPoint: number): Observable<DomoticzData> {
    return this.command(idx, 'setsetpoint', `setpoint=${setPoint}`)
  }

  setColor(idx: number, color: string, brightness: number): Observable<DomoticzData> {
    return this.command(idx, 'setcolbrightnessvalue',
      `hex=${color}&brightness=${brightness}&iswhite=${color === 'ffffff'}`)
  }

  switchLight(idx: number, switchcmd: string, additionalParams?: string): Observable<DomoticzData> {
    let params = `switchcmd=${switchcmd}`
    if (additionalParams) {
      params += `&${additionalParams}`
    }
    return this.command(idx, 'switchlight', params)
  }

  command(idx: number, type: string, params: string): Observable<DomoticzData> {
    const url = `${API_COMMAND}param=${type}&idx=${idx}&${params}`
    const observable = this.http.get<DomoticzData>(url)
    observable.subscribe({
      complete: () => console.log(url),
    })
    return observable
  }

  isWsOffline(): boolean {
    return !this.socket.wsOpen.value
  }

  updating(): boolean {
    return this.isUpdating
  }

  isOffline(): boolean {
    return Date.now() > this.lastUpdateTimestamp + BACK_UNRESPONSIVE_LIMIT_MS
  }

  toRgba(domoticzFormat: string, level: number): string {
    const data = JSON.parse(domoticzFormat)
    const a = level / 100.0
    return `rgba(${data.r},${data.g},${data.b},${a})`
  }

  private processWsMessage(msg: DomoticzWSResponse): void {
    if (msg && msg.data && msg.event === 'response' && msg.request === 'device_request') {
      const parsedData: DomoticzData = JSON.parse(msg.data)
      this.processJson(parsedData)
    }
  }

  private processJson(parsedData: DomoticzData): void {
    if (parsedData && parsedData.result && parsedData.result.length > 0) {
      const updatedDevice: Device = parsedData.result[0]
      this.updateDevice(updatedDevice)
    }
  }

  updateDevice(device: Device): void {
    const id = parseInt(device.idx, 10)
    this.devices.set(id, device)
    const subject = this.devicesSubjects.get(id)
    if (subject) {
      subject.next(device)
    }
  }

  private updateScene(scene: Device): void {
    const id = parseInt(scene.idx, 10)
    this.scenes.set(id, scene)
    const subject = this.sceneSubjects.get(id)
    if (subject) {
      subject.next(scene)
    }
  }
}
