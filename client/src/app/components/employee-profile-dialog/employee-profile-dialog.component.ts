import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-employee-profile-dialog',
  templateUrl: './employee-profile-dialog.component.html',
  styleUrls: ['./employee-profile-dialog.component.css']
})
export class EmployeeProfileDialogComponent {
  profile = this.data.profile;

  constructor(
    public dialogRef: MatDialogRef<EmployeeProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}
}
