import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Evento } from 'src/app/interfaces/evento-interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private urlEndPoint: string = 'http://localhost:8080/api/events';

  private httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})
  
  constructor( private http: HttpClient ) { }

  getEvents(): Observable<Evento[]> {
    //return of(EVENTOS);
    return this.http.get<Evento[]>(this.urlEndPoint);
  }

  createEvent(event: Evento) : Observable<Evento> {
    console.log(event);
    return this.http.post<Evento>(this.urlEndPoint, event, {headers: this.httpHeaders})
  }
  
  getEvent(id: number): Observable<Evento>{
    return this.http.get<Evento>(`${this.urlEndPoint}/${id}`)
  }
  
  deletEvent(id: number): Observable<Evento>{
    return this.http.delete<Evento>(`${this.urlEndPoint}/${id}`)
  }

  update(event: Evento): Observable<Evento>{
    return this.http.put<Evento>(`${this.urlEndPoint}/${event.id}`, event, {headers: this.httpHeaders})
  }
}
