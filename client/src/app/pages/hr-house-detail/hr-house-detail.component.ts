import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { House } from 'src/app/interfaces/house';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { HouseService } from 'src/app/services/house/house.service';
import { selectHouseById } from 'src/app/store/house/house.selector';
import { Report } from 'src/app/interfaces/report';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-hr-house-detail',
  templateUrl: './hr-house-detail.component.html',
  styleUrls: ['./hr-house-detail.component.css']
})
export class HrHouseDetailComponent implements OnInit {
  house$: Observable<House> | undefined;
  houseId!: string;
  pageIndex: number = 0;
  pageSize: number = 5;
  reports: Report[] | undefined;
  reportsForCurrPage: Report[] | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private houseService: HouseService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.houseService.getHouses();
    this.houseId = this.route.snapshot.paramMap.get('id') as string;
    this.house$ = this.store.pipe(select(selectHouseById(this.houseId)), map(house => {
      this.reports = house?.reports;
      this.reportsForCurrPage = this.reports?.slice(0, this.pageSize);
      return house;
    })) as Observable<House>;
    // console.log(this.house$)
  }

  onClickCard(rid: string): void {
    this.router.navigate(['/hrHousingManagement/house/' + this.houseId + '/report/' + rid]);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = (this.pageIndex + 1) * this.pageSize;
    this.reportsForCurrPage = this.reports && this.reports.slice(startIndex, endIndex);
  }
}
