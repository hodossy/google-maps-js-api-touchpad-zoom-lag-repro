import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';

import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { auditTime, catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  private readonly API_KEY: string = '';
  @ViewChild('interactions', { static: true }) private interactionDiv!: ElementRef<HTMLDivElement>;
  @ViewChild(GoogleMap, { static: false }) private _map: GoogleMap | undefined;

  mapApiLoaded$!: Observable<boolean>;
  mapOptions: google.maps.MapOptions = {
    // disableDefaultUI: true,
    keyboardShortcuts: false,
    // gestureHandling: 'none',
    mapTypeId: 'hybrid',
    tilt: 0,
  };

  defaultCenter = { lat: 47.475254, lng: 19.057351 };
  private _center = new BehaviorSubject<{lat: number, lng: number}>(this.defaultCenter);
  center$ = this._center.asObservable();

  defaultZoom = 16;
  private _zoomFactor = 1;
  private _zoom = new BehaviorSubject<number>(this.defaultZoom);
  zoom$ = this._zoom.asObservable();
  // zoom$ = this._zoom.asObservable().pipe(auditTime(16));

  constructor(private readonly httpClient: HttpClient) {
    this.mapApiLoaded$ = this.httpClient
      .jsonp(
        `https://maps.googleapis.com/maps/api/js?key=${this.API_KEY}`,
        'callback'
      )
      .pipe(
        map(() => true),
        catchError(() => observableOf(false))
      );
  }

  ngOnInit() {
    this.interactionDiv.nativeElement.addEventListener('wheel', (evt: WheelEvent) => {
      const wheelDelta = evt.deltaY;
      this._zoomFactor *= 0.999 ** wheelDelta;

      const zoomDelta = Math.log2(this._zoomFactor);
      this._zoom.next(this.defaultZoom + zoomDelta);

      // this is not working...
      // google.maps.event.trigger(this._map, 'wheel', evt)

      evt.preventDefault();
      evt.stopPropagation();
    }, {passive: false});
  }
}
