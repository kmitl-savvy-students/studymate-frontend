import { Component, Input } from '@angular/core';
import { ButtonComponent } from "../button/button.component";

@Component({
  selector: 'app-announce',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './announce.component.html',
  styleUrl: './announce.component.css'
})
export class AnnounceComponent {
  @Input() detail: string = '';
  @Input() date: string = '';
}
