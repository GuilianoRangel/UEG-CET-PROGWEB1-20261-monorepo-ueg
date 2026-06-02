import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MatchDto, CreateMatchPayload } from '@repo/utils';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/matches`;

  getMatches(): Observable<MatchDto[]> {
    return this.http.get<MatchDto[]>(this.apiUrl);
  }

  getMatchById(id: string): Observable<MatchDto> {
    return this.http.get<MatchDto>(`${this.apiUrl}/${id}`);
  }

  createMatch(payload: CreateMatchPayload): Observable<MatchDto> {
    return this.http.post<MatchDto>(this.apiUrl, payload);
  }

  updateMatch(id: string, payload: CreateMatchPayload): Observable<MatchDto> {
    return this.http.put<MatchDto>(`${this.apiUrl}/${id}`, payload);
  }

  closeMatch(id: string): Observable<MatchDto> {
    return this.http.put<MatchDto>(`${this.apiUrl}/${id}/close`, {});
  }

  deleteMatch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
