import {Component, HostListener, OnInit} from '@angular/core'
import {CookieService} from 'ngx-cookie-service'
import {environment} from 'src/environments/environment'
import {Router, RouterOutlet} from '@angular/router'
import {slideInAnimation} from 'src/app/animations'
import {DIRECTION_HORIZONTAL, TouchMouseInput} from 'hammerjs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slideInAnimation],
})
export class AppComponent implements OnInit {

  backgroundStyle = `background-image: url(${environment.baseDir + 'img/bg12.jpg'})`

  constructor(private router: Router, private cookieService: CookieService) {
  }

  ngOnInit(): void {
    this.cookieService.set('kath', 'vlvaoddhporiwprhskjd', 7, '/', undefined, true, 'Strict')
    this.initHammer()
  }

  getAnimationData(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData.animation
  }

  private initHammer(): void {
    const options: HammerOptions = {
      touchAction: 'auto',
      inputClass: TouchMouseInput,
      recognizers: [
        [Hammer.Swipe, {
          direction: DIRECTION_HORIZONTAL,
        }],
      ],
    }
    const hammer = new Hammer.Manager(document.documentElement, options)
    hammer.on('swipeleft', (event) => {
      if (event.deltaX < -50) {
        this.navigate(-1)
      }
    })
    hammer.on('swiperight', (event) => {
      if (event.deltaX > 50) {
        this.navigate(1)
      }
    })
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') {
      this.navigate(1)
    } else if (event.key === 'ArrowLeft') {
      this.navigate(-1)
    }
  }

  private navigate(number: 1 | -1): void {
    let page = parseInt(this.router.routerState.snapshot.url.replace('/', ''))
    page = page + number
    if (page > 2) {
      page = 1
    } else if (page < 1) {
      page = 2
    }
    // noinspection JSIgnoredPromiseFromCall
    this.router.navigate(['/' + page])
  }
}
