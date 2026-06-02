import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatchDto } from '@repo/utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GuessesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/guesses`;

  getOpenMatches(): Observable<MatchDto[]> {
    return this.http.get<MatchDto[]>(`${this.apiUrl}/open-matches`);
  }

  getMyClosedMatches(): Observable<MatchDto[]> {
    return this.http.get<MatchDto[]>(`${this.apiUrl}/my-closed-matches`);
  }

  submitGuess(payload: { matchId: string; predictionOptionId: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
