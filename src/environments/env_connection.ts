// backend.service.ts
import { Injectable } from '@angular/core';
import { HttpClient,} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
    private backendUrls = [
                'http://localhost:5002', // Fallback URL
                'http://macbook.tntdverse.com:5002',
                'http://localhost:5000'
            ];
  constructor(private http: HttpClient) {}

  // Method to check backend availability and return the URL of the accessible backend
  getBackendUrls(): string {
    // Check the first backend URL
    if (this.tryUrl(this.backendUrls[0])) {
      return this.backendUrls[0]; // Return the first URL if available
    } 
    
    // If the first URL fails, check the second URL
    if (this.tryUrl(this.backendUrls[1])) {
      return this.backendUrls[1]; // Return the second URL if available
    }

    if (this.tryUrl(this.backendUrls[2])) {
      return this.backendUrls[2]; // Return the second URL if available
    }
    
    return 'Both backend URLs are unavailable'; // Fallback message if both URLs are unavailable
  }

  // Synchronously try to connect to a URL (assuming it's a quick check, not for actual HTTP requests)
  private tryUrl(url: string): boolean {
    // Simple synchronous check logic (This is not a real HTTP check)
    try {
      const response = this.http.get(url); // Synchronously sending request (This will not work as expected)
      return response ? true : false;  // If the response is truthy, return true
    } catch (error) {
    //   console.error(`Failed to connect to ${url}: ${error.message}`);
      return false; // Return false if an error occurs
    }
  }
}
