import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GuessesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/guesses`;

  getOpenMatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/open-matches`);
  }

  getMyClosedMatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-closed-matches`);
  }

  submitGuess(matchId: string, predictionOptionId: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { matchId, predictionOptionId });
  }
}
