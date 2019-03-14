import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '../core.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  private serverHeartbeat: string;
  private serverMessage: any;
  private items = [];
  private selectedItem: any;

  constructor(
    private coreService: CoreService,
    private router: Router ) {
  }

  ngOnInit() {
    this.checkLoggedIn( () => {
      this.coreService.getRemoteEvents().subscribe( {
        next: evt => this.handleRemoteEvent( evt )
      } );
      this.coreService.sendCommand( { type: 'snap'} );
    } );
  }

  checkLoggedIn( runIfOK ) {
    if ( !this.coreService.isLoggedIn() ) {
      console.log( 'Not logged in, redirect to login page' );
      this.router.navigate( ['login'] );
    } else {
      runIfOK();
    }
  }

  handleRemoteEvent( evt ) {
    this.serverMessage = JSON.stringify( evt );
    switch ( evt.type ) {
      case 'hb':
        this.serverHeartbeat = evt.data;
        break;
      case 'emperoradded':
        this.items.push( evt.data );
        break;
      case 'emperorupdated':
        const item = this.items.find( i => i.id === evt.data.id );
        item.name = evt.data.name;
        item.year = evt.data.year;
        break;
      case 'emperordeleted':
        const idx = this.items.findIndex( i => i.id === evt.data.id );
        this.items.splice( idx, 1 );
        break;
    }
  }

  onSelectEdit( item ) {
    this.selectedItem = item;
  }

  onDelete( item ) {
    this.checkLoggedIn( () => {
      this.coreService.sendCommand( { type: 'delemperor', data: { id: item.id, name: item.name, year: item.year } } );
    } );
  }


  onAdd( evt, id, name, year ) {
    evt.preventDefault();
    this.checkLoggedIn( () => {
      this.coreService.sendCommand( { type: 'addemperor', data: { id: id, name: name, year: year } } );
    } );
  }

  onEdit( evt, id, name, year ) {
    evt.preventDefault();
    this.checkLoggedIn( () => {
      this.coreService.sendCommand( { type: 'updateemperor', data: { id: id, name: name, year: year } } );
    } );
  }
}
