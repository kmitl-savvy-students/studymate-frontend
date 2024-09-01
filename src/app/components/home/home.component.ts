import { Component } from '@angular/core';
import { AnnounceComponent } from "../announce/announce.component";
import { LetPlanComponent } from "../let-plan/let-plan.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AnnounceComponent, LetPlanComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
