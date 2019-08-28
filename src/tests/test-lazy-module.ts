import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { AdminState } from './test-states';
import { RouterModule } from '@angular/router';

@NgModule({ imports: [NgxsModule.forFeature([AdminState]), RouterModule.forChild([])] })
export class AdminModule {}
