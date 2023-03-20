import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
@Component({
  selector: 'app-reject-dialog',
  templateUrl: './reject-dialog.component.html',
  styleUrls: ['./reject-dialog.component.css'],
})
export class RejectDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      feedback: string;
      pid: string;
      nextStep: number;
      isRejectSucess: boolean;
    }
  ) {}
  // feedback:string
  onNoClick(): void {
    this.dialogRef.close();
  }
  reject() {
    console.log(this.data.nextStep);
    console.log(this.data.feedback);
    fetch(`http://localhost:3000/hr/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoxLCJlbWFpbCI6ImRhejAwNEB1Y3NkLmVkdSIsImlhdCI6MTY3ODE1NTE1MywiZXhwIjoxNjc4MTY1OTUzfQ.QRtihBwAhBvidh4scWNEv6GdiJY0AcgkxXPy7UNr_0g',
      },
      body: JSON.stringify({
        pid: this.data.pid,
        nextstep: this.data.nextStep - 1,
        feedback: this.data.feedback,
      }),
    })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((res) => {
        alert("reject successfully");
        this.data.isRejectSucess = true;
      })
      .then(() => {
        // this.dialogRef.close();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}
