import { Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(
    private sanitizer: DomSanitizer
  ) { }
  
  sanitizeImage(image: string | null | undefined): SafeResourceUrl {
    if(image != null) {
      return this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + image);
    }
    return '';
  }
}
