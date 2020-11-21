import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EditorCanvasComponent} from './editor-canvas/editor-canvas.component';

const routes: Routes = [
  {path: '', component: EditorCanvasComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
