import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http'
import {Injectable} from '@angular/core'
import {Observable, throwError} from 'rxjs'
import {catchError} from 'rxjs/operators'

@Injectable()
export class AppInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(httpError => {
        console.error(httpError)
        return throwError(httpError)
      }),
    )
  }
}
