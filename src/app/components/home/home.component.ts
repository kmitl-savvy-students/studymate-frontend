import { Component } from '@angular/core';
import { AnnounceComponent } from "../announce/announce.component";
import { LetPlanComponent } from "../let-plan/let-plan.component";
import { CardHomeComponent } from "../card-home/card-home.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AnnounceComponent, LetPlanComponent, CardHomeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
