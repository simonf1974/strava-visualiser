import { Injectable } from "@angular/core";
import { NgxIndexedDBService } from "ngx-indexed-db";
import { localDb } from "../model/model";

@Injectable({
  providedIn: "root"
})
export class LocaldbService {
  constructor(private localDbService: NgxIndexedDBService) {
    localDbService.currentStore = "ridecache";
  }

  get(key: string | number): Promise<any> {
    return this.localDbService.getByIndex(localDb.key, key);
  }

  add(key: string | number, value: string): Promise<any> {
    return this.localDbService.add({ key: key, value: value });
  }

  clear() {
    return this.localDbService.clear();
  }
}
