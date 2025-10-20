import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DashboardService, Ticket } from '../../services/dashboard.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Angular Material imports
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.css']
})
export class TicketsComponent implements OnInit {
  displayedColumns: string[] = ['ticket_id', 'customer_email', 'subject', 'category', 'severity', 'priority', 'status', 'created_at', 'actions'];
  dataSource = new MatTableDataSource<Ticket>();
  totalTickets = 0;
  isLoading = false;

  statusFilter = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadTickets();
    
    this.statusFilter.valueChanges.subscribe(() => {
      if (this.paginator) {
        this.paginator.firstPage();
      }
      this.loadTickets();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadTickets(): void {
    this.isLoading = true;
    const page = this.paginator?.pageIndex || 0;
    const limit = this.paginator?.pageSize || 10;
    const status = this.statusFilter.value || '';

    this.dashboardService.getTickets(page + 1, limit, status).subscribe({
      next: (response) => {
        this.dataSource.data = response.tickets;
        this.totalTickets = response.total;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.isLoading = false;
      }
    });
  }

  onPageChange(): void {
    this.loadTickets();
  }

  onStatusChange(ticket: Ticket, event: any): void {
    const newStatus = event.value;
    this.dashboardService.updateTicketStatus(ticket.ticket_id, newStatus).subscribe({
      next: () => {
        ticket.status = newStatus;
      },
      error: (error) => {
        console.error('Error updating ticket status:', error);
      }
    });
  }

  getPriorityColor(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'p1': return 'warn';
      case 'p2': return 'accent';
      case 'p3': return 'primary';
      default: return '';
    }
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