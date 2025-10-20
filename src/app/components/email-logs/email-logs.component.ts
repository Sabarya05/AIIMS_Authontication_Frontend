import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardService, EmailLog } from '../../services/dashboard.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Angular Material imports
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-email-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './email-logs.component.html',
  styleUrls: ['./email-logs.component.css']
})
export class EmailLogsComponent implements OnInit {
  displayedColumns: string[] = ['from_email', 'subject', 'category', 'severity', 'status', 'created_at'];
  dataSource = new MatTableDataSource<EmailLog>();
  totalLogs = 0;
  isLoading = false;

  searchControl = new FormControl('');
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadEmailLogs();
    
    // Search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.paginator.firstPage();
        this.loadEmailLogs();
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadEmailLogs(): void {
    this.isLoading = true;
    const page = this.paginator?.pageIndex || 0;
    const limit = this.paginator?.pageSize || 10;
    const search = this.searchControl.value || '';

    this.dashboardService.getEmailLogs(page + 1, limit, search).subscribe({
      next: (response) => {
        this.dataSource.data = response.logs;
        this.totalLogs = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading email logs:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(): void {
    this.loadEmailLogs();
  }

  getSeverityColor(severity: string): string {
    switch (severity?.toLowerCase()) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return '';
    }
  }
}