import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pic-box-home',
  standalone: true,
  imports: [],
  templateUrl: './pic-box-home.component.html',
  styleUrl: './pic-box-home.component.css'
})
export class PicBoxHomeComponent {
  @Input() image: string = '';
}
