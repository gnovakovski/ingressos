import { Component } from '@angular/core';
import { LucideAngularModule, Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  readonly Facebook = Facebook;
  readonly Instagram = Instagram;
  readonly Twitter = Twitter;
  readonly Mail = Mail;
  readonly Phone = Phone;
}
