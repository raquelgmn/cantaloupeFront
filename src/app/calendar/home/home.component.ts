import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular'; // useful for typechecking
import esLocale from '@fullcalendar/core/locales/es';
import { Evento } from 'src/app/interfaces/evento-interfaces';
import { FormControl, FormGroup } from '@angular/forms';
import { EventService } from '../../services/event/event.service';
import { Time } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

// Formulario

  addEventsForm = new FormGroup({
    id: new FormControl(),
    date: new FormControl(),
    hour: new FormControl(),
    description: new FormControl()
  });

  // references the #calendar in the template
  @ViewChild('calendar')
  calendarComponent!: FullCalendarComponent;

  newEvent!: Evento;

  display: boolean = false; //Boolean dialog
  displayFecha: boolean = false;
  pbuttonDelete: boolean = true;

  date!: Date;
  hour!: Time;
  descripcion!: string;

  newEventCreate!: Evento;
  // myEvents = [
  //   { title: 'event 1', date: '2022-10-01' },
  //   { title: 'event 2', date: '2022-10-02' }
  // ];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    locales: [ esLocale ],
    dateClick: this.handleDateClick.bind(this), // bind is important!
    //events: this.myEvents,
    customButtons: {
      add_event: {
          text: 'Añadir',
          click: () => {
            this.addEvent()
          }
      }
  },
    headerToolbar: {
        left: 'prev,next today add_event',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: false,
    selectable:true,
    selectMirror: true,
    dayMaxEvents: true,
    firstDay: 1,
    eventTimeFormat: { // like '14:30:00'
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    },
    displayEventTime: true,

    eventClick:(arg) => {
      this.displayFecha = true;
      console.log('Click' + JSON.stringify(arg.event));
      this.pbuttonDelete = false;
      this.showEvent(parseInt(arg.event.id));
      // alert(arg.event.title)
      // alert(arg.event.start)
    },
    
  };

  constructor( private eventService: EventService ) { }

  ngOnInit(): void {
    this.newEvent = {
      id: null,
      event_date: null,      
      event_time: null,
      description: '',
      timestamp: null
    }
 
    this.getEvents();

  }

  handleDateClick(arg: any) {
    alert('date click! ' + arg.dateStr)
  }

  toggleWeekends() {
    this.calendarOptions.weekends = !this.calendarOptions.weekends // toggle the boolean!
  }


  addEvent() {
    
    this.display = true;
    console.log('Estoy en addEvent');

  }

  closeDialog() {
    this.display = false;
  }

  dialogFecha() {
    console.log('Estoy en dialoFecha');
    this.display = false;
    this.displayFecha = true;
  }

  closedialogFecha() {
    this.displayFecha = false;
    this.pbuttonDelete = true;
    // Se resetena lo valores del formulario
    this.addEventsForm.reset();
  }

  deleteEventBtn() {
    const id = this.addEventsForm.value['id'];
    console.log(id);
    this.displayFecha = false;
    this.deleteEvent(id);
    // Se resetena lo valores del formulario
    this.addEventsForm.reset();
  }

  agregar( ) {
    if(this.newEvent.description.trim().length !== 0 ){
      console.log(this.newEvent);
      return;
    }
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
   
    const date = this.addEventsForm.value['date'];
    const hour = this.addEventsForm.value['hour'];
    const description = this.addEventsForm.value['description'];
    const id = this.addEventsForm.value['id'];
    console.log('onSubmit' + this.addEventsForm.value.hour);

    if ( id === null ){

      this.newEventCreate = {
        id: null,
        event_date: date,      
        event_time: hour,
        description: description,
        timestamp: null
      };

      this.saveEvents(this.newEventCreate);

    } else {

      this.newEventCreate = {
        id: id,
        event_date: date,      
        event_time: hour,
        description: description,
        timestamp: null
      };
      
      this.updateEvent(this.newEventCreate);

    }
    
    // Se resetena lo valores del formulario
    this.addEventsForm.reset();
  }

  getEvents() {
    this.eventService.getEvents().subscribe((successResponse) => {

      const calendarApi = this.calendarComponent.getApi();
      successResponse.forEach( x => {
        let d = new Date(x.event_date);
        //console.log('Date : ' + d);
        let dateString = d.getFullYear() + '-' + (d.getUTCMonth()+1) + '-' + (('0'+d.getDate()).slice(-2)) + ' ' + x.event_time;
        //console.log('Formateo: ' + dateString)
        calendarApi.addEvent( {id: x.id, title: x.description, date: x.event_date, start: dateString} );
      });

    }, (errorResponse) => {
      console.error(errorResponse)
    });
  }

  saveEvents(eventCreate: Evento) {

    let d = new Date(eventCreate.event_time);
    console.log(d)
    let timeString = d.getHours()  + ':' + d.getMinutes() + ':00';
    eventCreate.event_time = timeString;

    this.eventService.createEvent(eventCreate).subscribe((succesResponse) => {
      console.log(succesResponse);
      this.displayFecha = false;

      const calendarApi = this.calendarComponent.getApi();
      let d = new Date(succesResponse.event_date);
      let dateString = d.getFullYear() + '-' + (d.getUTCMonth()+1) + '-' + (('0'+d.getDate()).slice(-2)) + ' ' + succesResponse.event_time;

      calendarApi.addEvent({id: succesResponse.id, title: succesResponse.description, date: succesResponse.event_date, start: dateString });
    }, (errorResponse) => {
      console.error(errorResponse)
    });
  }

  showEvent(id: number): void {
    this.eventService.getEvent(id).subscribe((succesResponse) => {
      console.log(succesResponse);
      let d = new Date(succesResponse.event_date);
      this.addEventsForm.controls['date'].setValue(d);
      let v = succesResponse.event_time.split(':');
      d.setHours(v[0],v[1],v[2]);

      this.addEventsForm.controls['hour'].setValue(d);
      this.addEventsForm.controls['description'].setValue(succesResponse.description);
      this.addEventsForm.controls['id'].setValue(succesResponse.id);
    }, (errorResponse) => {
      console.error(errorResponse)
    });
  }

  deleteEvent(id: number): void {
    this.eventService.deletEvent(id).subscribe((succesResponse) => {
      console.log(succesResponse);
      const calendarApi = this.calendarComponent.getApi();
      var event = calendarApi.getEventById(id.toString());
      event?.remove();
    }, (errorResponse) => {
      console.error(errorResponse)
    });
  }

  updateEvent(eventMod : Evento): void {
    this.eventService.update(eventMod).subscribe(succesResponse => {
        console.log(succesResponse);
        this.displayFecha = false;

      const calendarApi = this.calendarComponent.getApi();
      var event = calendarApi.getEventById(eventMod.id.toString());
      event?.remove();
      calendarApi.addEvent({id: succesResponse.id, title: succesResponse.description, date: succesResponse.event_date, start: succesResponse.event_time });
      }, (errorResponse) => {
        console.error(errorResponse)
      })
  }

}
