import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-announce',
  standalone: true,
  imports: [],
  templateUrl: './announce.component.html',
  styleUrl: './announce.component.css'
})
export class AnnounceComponent {
  @Input() detail: string = '';
  @Input() date: string = '';
}
