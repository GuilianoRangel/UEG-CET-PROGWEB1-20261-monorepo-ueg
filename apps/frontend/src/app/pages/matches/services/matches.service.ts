import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MatchDto, CreateMatchPayload } from '@repo/utils';

@Injectable({
  providedIn: 'root',
})
export class MatchesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/matches`;

  getMatches(): Observable<MatchDto[]> {
    return this.http.get<MatchDto[]>(this.apiUrl);
  }

  getMatch(id: string): Observable<MatchDto> {
    return this.http.get<MatchDto>(`${this.apiUrl}/${id}`);
  }

  createMatch(payload: CreateMatchPayload): Observable<MatchDto> {
    return this.http.post<MatchDto>(this.apiUrl, payload);
  }

  updateMatch(id: string, payload: Partial<CreateMatchPayload>): Observable<MatchDto> {
    return this.http.put<MatchDto>(`${this.apiUrl}/${id}`, payload);
  }

  closeMatch(id: string): Observable<MatchDto> {
    return this.http.put<MatchDto>(`${this.apiUrl}/${id}/close`, {});
  }

  deleteMatch(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
