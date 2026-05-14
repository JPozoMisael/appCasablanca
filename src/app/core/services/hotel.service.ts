import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  map,
  catchError,
  of
} from 'rxjs';

import {
  environment
} from 'src/environments/environment';

import {
  Hotel
} from '@app/shared/models/hotel.model';

/* ======================================================
   API RESPONSE
====================================================== */

interface ApiResponse<T> {

  ok: boolean;

  data: T;

  meta?: any;
}

@Injectable({
  providedIn: 'root'
})

export class HotelesService {

  /* ======================================================
     API
  ====================================================== */

  private API =
    `${environment.apiUrl}/hotels`;

  constructor(
    private http: HttpClient
  ) {}

  /* ======================================================
     GET ALL
  ====================================================== */

  getAll(): Observable<Hotel[]> {

    return this.http
      .get<ApiResponse<Hotel[]>>(
        this.API
      )
      .pipe(

        map(
          res => res.data || []
        ),

        catchError(err => {

          console.error(
            'Error getAll hoteles:',
            err
          );

          return of([]);
        })
      );
  }

  /* ======================================================
     RESUMEN
  ====================================================== */

  getResumen(): Observable<Hotel[]> {

    return this.http
      .get<ApiResponse<Hotel[]>>(
        `${this.API}/resumen`
      )
      .pipe(

        map(
          res => res.data || []
        ),

        catchError(err => {

          console.error(
            'Error getResumen:',
            err
          );

          return of([]);
        })
      );
  }

  /* ======================================================
     FEATURED
  ====================================================== */

  getFeatured(): Observable<any | null> {

    return this.http
      .get<ApiResponse<any>>(
        `${this.API}/featured`
      )
      .pipe(

        map(
          res => res.data || null
        ),

        catchError(err => {

          console.error(
            'Error getFeatured:',
            err
          );

          return of(null);
        })
      );
  }

  /* ======================================================
     BY ID
  ====================================================== */

  getById(
    id: number
  ): Observable<Hotel | null> {

    return this.http
      .get<ApiResponse<Hotel>>(
        `${this.API}/${id}`
      )
      .pipe(

        map(
          res => res.data || null
        ),

        catchError(err => {

          console.error(
            'Error getById:',
            err
          );

          return of(null);
        })
      );
  }

  /* ======================================================
     BY SLUG
  ====================================================== */

  getBySlug(
    slug: string
  ): Observable<Hotel | null> {

    if (!slug) {

      console.error(
        'Slug vacío'
      );

      return of(null);
    }

    return this.http
      .get<ApiResponse<Hotel>>(
        `${this.API}/slug/${slug}`
      )
      .pipe(

        map(
          res => res.data || null
        ),

        catchError(err => {

          console.error(
            'Error getBySlug:',
            err
          );

          return of(null);
        })
      );
  }
}