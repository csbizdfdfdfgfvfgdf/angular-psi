import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef, ViewChildren, Inject, ChangeDetectorRef } from '@angular/core';
import { Observable, fromEvent, Subject, timer } from 'rxjs';
import { CdkDropList, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { User, RegisterUser } from 'src/app/model/user';
import { NzMessageService, NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { LoginService } from 'src/app/login/login.service';
import { Router } from '@angular/router';
import { takeUntil, throttleTime } from 'rxjs/operators';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource, MatTreeNode } from '@angular/material/tree';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatMenuTrigger } from '@angular/material/menu';
import { Item } from 'src/app/model/item';
import { Menu } from 'src/app/model/menu';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NoteService } from './note.service';
import { Note2Service } from './note2.service';

declare var $: any;
interface TreeNodeData {
  children: any[];
  expanded: boolean;
  key: any;
  menuId: any;
  menuName: any;
  orderId: any;
  pId: any;
  title: any;
  uId: any;
  userName: any;
  userType: any;
}
@Component({
  selector: 'app-manage-notepad',
  templateUrl: './manage-notepad.component.html',
  styleUrls: ['./manage-notepad.component.less']
})

export class ManageNotepadComponent implements OnInit, AfterViewInit, OnDestroy {
  keyEnter: Observable<any> = fromEvent(window, 'keyup.enter');
  activeNode: any;
  @ViewChildren(MatTreeNode, { read: ElementRef }) treeNodes: ElementRef[];
  submitSubject: Subject<any> = new Subject();
  submitFolder: Subject<string> = new Subject();
  destroy$ = new Subject();
  user: User = new User();
  isSpinning = false;
  fieldContent = '';
  editId = null;
  size = 'small';
  activatedId = null;
  done = [];
  folderList: any[] = [];
  treeMenu: any[] = [];
  noteList: any[] = [];
  activeItem: any;
  targetItem: any;
  selectedNode: any;
  backgroundColor: any = 'AliceBlue';
  colors: any = ['AliceBlue', 'AntiqueWhite', 'Beige', 'DarkGrey', 'DarkSeaGreen', 'Gainsboro']
  dragingItem: any;
  dragingMenu: any;
  treeControl = new NestedTreeControl<TreeNodeData>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeNodeData>();
  hasChild = (_: number, node: TreeNodeData) => !!node.children && node.children.length > 0;
  pId = 0;
  Visible = false;
  isOkLoading = false;
  addFileItem: { menuName: string, pId: number } = { menuName: '', pId: this.pId };
  activeNote:any;
  constructor(private msgService: NzMessageService,
    private noteService: NoteService,
    private loginService: LoginService,
    private note2Service: Note2Service,
    public dialog: MatDialog,
    public translate: TranslateService,
    private route: Router,
    private changeRef: ChangeDetectorRef,
    public spinner: NgxSpinnerService,
    private nzContextMenuService: NzContextMenuService) {

  }
  ngOnInit(): void {
    this.getUser();
    this.translate.addLangs(['en', 'ch']);
    let dfltLang = localStorage.getItem('lang');
    if (dfltLang != null && dfltLang != '') {
      this.translate.use(dfltLang);
      this.translate.setDefaultLang(dfltLang);
    } else {
      this.translate.use('en');
      this.translate.setDefaultLang('en');
    }
  }
  switchLang(lang: string) {
    this.translate.use(lang);
    localStorage.removeItem('lang');
    localStorage.setItem('lang', lang);
  }
  ngAfterViewInit() {
    this.submitSubject.pipe(
      throttleTime(500),
      takeUntil(this.destroy$)
    ).subscribe(res => {
      const key = this.selectedNode.key;
      this.spinner.show();
      this.noteService.addItem([{ pId: key, content: res.content, orderId: res.orderId }])
        .subscribe(
          res2 => {
            this.spinner.hide();
            this.fieldContent = '';
            this.isUserAlreadyExist = true;
            if (this.selectedNode) {
              this.getItems();
            } else {
              this.getItemsByUserId();
            }
          }
        );
    });
    this.submitFolder.pipe(
      throttleTime(500),
      takeUntil(this.destroy$)
    ).subscribe(data => {
      this.spinner.show();
      this.note2Service.addFile([data]).subscribe(
        res => {
          this.addFileItem.menuName = '';
          this.addFileItem.pId = null;
          this.isOkLoading = false;
          this.getMenuList();
        }
      );
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  dragStarted(item: any) {
    this.dragingItem = item;
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.dragingItem.orderId = event.currentIndex;
      moveItemInArray(this.noteList, event.previousIndex, event.currentIndex);
      this.updateItemSortOrder();
    } else {
    }
  }

  dropTree(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.spinner.show();
      if(this.dragingMenu) {
        this.dragingMenu.orderId = event.currentIndex;
      }
      moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
      this.updateFolderSortOrder();
    } else {
    }

  }

  updateItemSortOrder() {
    this.noteList.forEach((note, index) => {
      note.orderId = index;
    });
    const updatedData = [];
    this.noteList.forEach((note) => {
      updatedData.push({
        itemId: note.itemId,
        content: note.content,
        orderId: note.orderId,
        uId: note.uId,
        userName: note.userName,
        pId: note.pId
      })
    })
    this.updateItemSort(updatedData);
  }

  dragFolderStarted(menu) {
    this.dragingMenu = menu;
  }


  updateFolderSortOrder() {
    this.dataSource.data.forEach((folder, index) => {
      folder.orderId = index;
    });
    const updatedData = [];
    this.dataSource.data.forEach((folder) => {
      updatedData.push({
        menuId: folder.menuId,
        menuName: folder.menuName,
        orderId: folder.orderId,
        pId: folder.pId,
        uId: folder.uId,
        userName: folder.userName,
        userType: folder.userType
      })
    })
    this.updateMenuSort(updatedData);
  }
  dragStartedOld(item: any, i: number, dragEl: HTMLElement) {
    this.spinner.show();

    this.noteService.dragSubject.next({ item, index: i });
  }
  startEdit(id: string) {
    this.editId = id;
  }
  stopEdit(item) {
    this.editId = null;
    this.editItem(item);
  }
  editItem(item) {
    this.spinner.show();
    this.noteList.forEach((note) => {
      if (note.itemId === item.itemId) {
        note.content = item.content
      }
    });
    this.noteService.editItem(this.noteList)
      .subscribe(
        res => {
          this.spinner.hide();
          this.editItemData = new Item();
          this.getItems();
        });
  }
  editFile(data) {
    this.spinner.show();
    this.note2Service.editFile([{ menuId: data.key, menuName: data.menuName, orderId : data.orderId }]).subscribe(
      res => {
        this.editMenuData = new Menu();
        this.spinner.hide();
        this.getMenuList();
      }
    );
  }
  getMenuList(key?: string) {
    this.noteService.getMenus().subscribe(res => {
      this.isUserAlreadyExist = true;
      this.treeMenu = [];
      this.dataSource = new MatTreeNestedDataSource<TreeNodeData>();
      this.selectedNode = null;
      if (res) {
        this.folderList = res;
        this.makeTreeData(res);
      }
    }, (error) => {
      this.spinner.hide();
    });
  }
  makeTreeData(menus: any[]) {
    this.spinner.show();
    menus.forEach(element => {
      let parent: any = menus.find(item => item.menuId == element.pId && element.pId != 0 && element.pId != null);
      if (parent) {
        parent.children = parent.children ? parent.children : [];
        parent.children.push(element);
      }
    });
    menus.forEach(element => {
      if (element.pId == 0 || element.pId == null) {
        this.treeMenu.push(element)
      }
    });
    this.dataSource.data = this.treeMenu;
    if (this.isUserAlreadyExist) {
      this.getItemsByUserId();
    }  
    this.spinner.hide(); 
  }
  clearList() {
    this.done = [];
  }
  isUserAlreadyExist: boolean = true;
  isOpenUser: boolean = false;
  getUser() {
    this.spinner.show();
    this.noteService.getUser().subscribe((res: any) => {
      if (res && res.userType == "VISITOR") {
        this.isOpenUser = true;
      } else {
        this.isOpenUser = false;
      }
      this.user = res;
      this.spinner.hide();
      this.getMenuList();
    }, (error) => {
      this.spinner.hide();
      this.isOpenUser = true;
      //   if (error.status === 401) { 
      if (!localStorage.getItem('uuid')) {
        this.isUserAlreadyExist = false;
        //   this.getUuid();
      } else {
        this.getMenuList();
      }
      //   }
    });
  }
  startReloading() {
    const source = timer(1000, 10000);
    source.subscribe(val => this.getUpdatedMenus());
  }
  getUpdatedMenus() {
    this.noteService.getMenus().subscribe(res => {
      let newTreeData = [];
      let dataSource = new MatTreeNestedDataSource<TreeNodeData>();
      if (res) {
        this.folderList = res;
        res.forEach(element => {
          let parent: any = res.find(item => item.menuId == element.pId && element.pId != 0 && element.pId != null);
          if (parent) {
            parent.children = parent.children ? parent.children : [];
            parent.children.push(element);
          }
        });
        res.forEach(element => {
          if (element.pId == 0 || element.pId == null) {
            newTreeData.push(element)
          }
        });
        if (newTreeData.length != this.treeMenu.length) {
          this.treeMenu = newTreeData;
          dataSource.data = newTreeData;
          this.dataSource = new MatTreeNestedDataSource<TreeNodeData>();
          this.dataSource = dataSource;
          this.activeNode = this.treeMenu[0];
          this.activatedNodeChange(this.activeNode);
        }
      }
    }, (error) => {
      this.spinner.hide();
    });
  }
  getUuid() {
    this.spinner.show();
    this.noteService.getUuid().subscribe((res) => {
      this.spinner.hide();
      this.noteService.uuidSubject.next(res.data);
      localStorage.setItem('uuid', res.data);
      this.handleOk();
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });
  }
  getUuidForRootNote() {
    this.spinner.show();
    this.noteService.getUuid().subscribe((res) => {
      this.spinner.hide();
      this.noteService.uuidSubject.next(res.data);
      localStorage.setItem('uuid', res.data);
      this.isUserAlreadyExist = true;
      this.submit();
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });
  }
  // 退出
  logout() {
    if (this.isOpenUser) {
      if (confirm("Your Data Will Loss")) {
        this.route.navigateByUrl('login');
        localStorage.removeItem('uuid');
        sessionStorage.removeItem('token');
      }
    } else {
      this.route.navigateByUrl('login');
      localStorage.removeItem('uuid');
      sessionStorage.removeItem('token');
    }
  }
  // 活动节点变动
  activatedNodeChange(activeNode) {
    this.selectedNode = activeNode;
    this.getItems();
  }
  submit() {
    if (this.selectedNode && this.folderList.length > 0) {
      if (this.fieldContent !== null && this.fieldContent != '') {
        let orderId = this.noteList.length;
        let item = { itemId: this.noteList.length + 1, content: this.fieldContent }
        this.noteList.push(item);
        this.msgService.success(this.getTranslationString('notepad.addedSuccess', ''));
        this.submitSubject.next({ content: this.fieldContent, orderId });
        this.fieldContent = '';
      }
    } else {
      this.addRootFile();
    }
  }
  checkUsetExistForRootNote() {
    this.Visible = false;
    if (this.isUserAlreadyExist) {
      this.submit();
    } else {
      if (!localStorage.getItem('uuid')) {
        this.getUuidForRootNote();
      }
    }
  }
  addRootFile() {
    let orderId = this.noteList.length;
    let item = { itemId: this.noteList.length + 1, content: this.fieldContent, orderId: this.noteList.length }
    this.noteList.push(item);
    this.spinner.show();
    this.noteService.addItem([{ pId: null, content: this.fieldContent, orderId }])
      .subscribe(
        res2 => {
          this.spinner.hide();
          this.fieldContent = '';
          this.getItemsByUserId();
        }
      );
  }
  getItems() {
    if (this.selectedNode && this.selectedNode.menuId) {
      const key = this.selectedNode.menuId;
      this.spinner.show();
      this.noteService.getItems({ pId: key }).subscribe(
        (res: Item[]) => {
          this.spinner.hide();
          this.noteList = res.sort((a, b) => a.orderId - b.orderId);
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    } else {
      this.getItemsByUserId();
    }
  }

  getRootNOte() {
    this.selectedNode = null;
    this.activeNode = null;
    this.getItemsByUserId();
  }
  getItemsByUserId() {
    this.noteService.getItemsByUser().subscribe(
      (res: Item[]) => {
        this.noteList = res;
      }, (error) => {
        console.log(error);
      });
  }
  updateItemSort(tmpnode) {
    this.noteService.updateItemSort_gen(tmpnode).subscribe(
      res => {
        this.getItems();
      }, (error) => {
      });
  }
  updateMenuSort(tmpnode) {
    this.note2Service.updateMenuSort_gen(tmpnode).subscribe(res => {
      this.getMenuList();
    });
  }
  copy(item) {
  }
  cut(item) {
  }
  paste(item) {
  }
  setMoveItem() {
  }
  //===================add edit delete folder=================
  showModal(): void {
    this.Visible = true;
  }
  checkUsetExist() {
    this.Visible = false;
    if (this.isUserAlreadyExist) {
      this.handleOk();
    } else {
      if (!localStorage.getItem('uuid')) {
        this.getUuid();
      }
    }
  }
  handleOk(): void {
    let copy = JSON.parse(JSON.stringify(this.addFileItem))
    copy.orderId = this.folderList.length;
    this.treeMenu = [];
    this.folderList.push(copy);
    this.makeTreeData(this.folderList);
    this.addFileItem.menuName = '';
    this.addFileItem.pId = null;
    this.msgService.success(this.getTranslationString('notepad.addedSuccess', ''));
    this.submitFolder.next(copy);
  }
  handleCancel(): void {
    this.Visible = false;
  }
  add(e, key) {
    e.stopPropagation();
    this.addFileItem.pId = this.pId = key;
    this.addFile();
  }
  addFile() {
    this.showModal();
  }
  addFootFile() {
    if (this.selectedNode && this.selectedNode.menuId) {
      const key = this.selectedNode.menuId;
      this.addFileItem.pId = key;
    } else {
      this.addFileItem.pId = null;
    }
    this.showModal(); 
  }
  // cut,copy and paste right click menus
  isRecCopyCut: boolean = false;
  recForCopyCut: any;
  recTypeForCopyCut: any;
  @ViewChild(MatMenuTrigger)
  contextMenu: MatMenuTrigger;
  isNoteMenuPaste: boolean = false;
  contextMenuPosition = { x: '0px', y: '0px' };
  contextMenus: any = [];
  // dynamicaly lists for context menus
  generalcontextMenusItem: any[] = [{ type: 'cut', icon: 'content_cut', key: 'contetMenu.cut' },
                                { type: 'copy', icon: 'content_copy', key: 'contetMenu.copy' },
                                { type: 'edit', icon: 'edit', key: 'contetMenu.edit' },
                                { type: 'delete', icon: 'delete_outline', key: 'contetMenu.delete' }];
  generalcontextMenus: any[] = [{ type: 'cut', icon: 'content_cut', key: 'contetMenu.cut' },
                                { type: 'copy', icon: 'content_copy', key: 'contetMenu.copy' },
                                { type: 'paste', icon: 'content_paste', key: 'contetMenu.paste' },
                                { type: 'edit', icon: 'edit', key: 'contetMenu.edit' },
                                { type: 'delete', icon: 'delete_outline', key: 'contetMenu.delete' }];
  menuBodycontextMenus: any[] = [{ type: 'create_new_folder', icon: 'create_new_folder', key: 'contetMenu.newFolder' },
                                 { type: 'paste', icon: 'content_paste', key: 'contetMenu.paste' }];
  itemBodycontextMenus: any[] = [{ type: 'paste', icon: 'content_paste', key: 'contetMenu.paste' }];
 
  isInnerMenuClicked:Boolean = false;
  onContextMenuItem(event: MouseEvent, item: any = null,isInnerMenuClicked = false) {
    event.preventDefault();
    if(item){
      this.isInnerMenuClicked = isInnerMenuClicked;
      this.contextMenu.menuData = { 'item': item, 'recType': 'note' };
      this.contextMenus = this.generalcontextMenusItem;
    }else{
     if(!this.isInnerMenuClicked){
      this.contextMenu.menuData = { 'item': null, 'recType': 'note' };
      this.contextMenus = this.itemBodycontextMenus;
     }
     this.isInnerMenuClicked = isInnerMenuClicked;
    }
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
  onContextMenu(event: MouseEvent, item: any, recType: any) {
    event.preventDefault();
    this.contextMenus = this.generalcontextMenus;
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item, 'recType': recType };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }
  // when context menu clicked
  onContextMenuAction(item: any, recType, action) {
    if (action == 'create_new_folder') {
      this.addFileItem.pId = this.pId = item.key;
      this.addFile();
    }
    if (action == 'copy') {
      this.isNoteMenuPaste = true;
      this.isRecCopyCut = true;
      this.recForCopyCut = item;
      this.recTypeForCopyCut = recType;
    }
    if (action == 'cut') {
      this.isNoteMenuPaste = true;
      this.isRecCopyCut = false;
      this.recForCopyCut = item;
      this.recTypeForCopyCut = recType;
    }
    if (action == 'paste') {
      this.isNoteMenuPaste = false;
      if(this.recTypeForCopyCut == 'note'){
        if(item){ // this case when you right click to folder and paste
          this.pasteNote(item);
        }else{  // this case when you click on right side area to paste note
          this.pasteNote(this.selectedNode); 
        }
      }else{
        if(item){
          this.pasteMenuOrNote(item);
        }else{
          this.pasteMenuOrNote(this.selectedNode); 
        } 
      } 
    }
    if (action == 'edit') {
      this.openEdotDialog(item, recType);
    }
    if (action == 'delete') {
      if (confirm("Are you sure to delete this record")) {
        this.deleteMenuOrNote(item, recType);
      }
    }
  }
  pasteNote(targetItem) {
    if (this.isRecCopyCut) {
      let data = { pId: targetItem.pId?targetItem.pId:targetItem.menuId, content: 'copy of: ' + this.recForCopyCut.content, orderId: targetItem.orderId };
      this.noteService.addItem([data])
        .subscribe(
          res => {
            this.noteList.splice(targetItem.orderId, 0, res[0]);
            this.updateItemSortOrder();;
          }
        );

    } else {
      if(this.noteList[0].pId === this.recForCopyCut.pId) {
        moveItemInArray(this.noteList, this.recForCopyCut.orderId, targetItem.orderId);
      }else {
        this.recForCopyCut.pId = targetItem.pId;
        this.noteList.splice(targetItem.orderId, 0 , this.recForCopyCut);
      }
      this.updateItemSortOrder();
    }
  }

  pasteMenuOrNote(targetItem) {
    if((targetItem.menuId === this.recForCopyCut.pId) || this.recTypeForCopyCut === 'menu') {
      if (this.isRecCopyCut) {
        let data = { pId: null, menuName: 'copy of: ' + this.recForCopyCut.menuName, orderId: targetItem.orderId };
         this.note2Service.addFile([data])
          .subscribe(
            res => {
              this.folderList.splice(targetItem.orderId, 0, res[0]);
              this.updateFolderSortOrder();
            }
          );
  
      } else {
        moveItemInArray(this.dataSource.data, this.recForCopyCut.orderId, targetItem.orderId);
        this.updateFolderSortOrder();
      }
    }else {
      this.selectedNode = targetItem;
      this.changeRef.detectChanges();
      this.noteService.getItems({ pId: targetItem.menuId  }).subscribe(
        (res: Item[]) => {
          this.spinner.hide();
          this.noteList = res.sort((a, b) => a.orderId - b.orderId);
          this.recForCopyCut.pId = targetItem.menuId;
       
          if(this.isRecCopyCut) {
            let data = { pId: targetItem.menuId, content: 'copy of: ' + this.recForCopyCut.content, orderId: targetItem.orderId };
            this.recForCopyCut.content = 'copy of: ' + this.recForCopyCut.content;
            this.noteService.addItem([data])
            .subscribe(
              res => {
                this.noteList.splice(targetItem.orderId, 0, res[0]);
                this.updateItemSortOrder();;
              }
            );
          }else {
            this.noteList.splice(targetItem.orderId, 0 , this.recForCopyCut);
            this.updateItemSortOrder();
          }          
          this.selectedNode = targetItem;

          // this.updateFolderSortOrder();
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    } 
  }
  copyMenuToMenu(targetItem, recForCopyCut) {
    let menu: Menu = new Menu();
    menu.menuName = 'copy of:' + recForCopyCut.menuName;
    menu.pId = targetItem.menuId ? targetItem.menuId : 0;
    this.spinner.show();
    this.note2Service.addFile(menu).subscribe(
      res => {
        this.spinner.show();
        this.getMenuList();
      }
    );
  }
  cutMenuToMenu(targetItem, recForCopyCut) {
    let menu: Menu = new Menu();
    menu.menuId = recForCopyCut.menuId;
    menu.orderId = recForCopyCut.orderId;
    menu.pId = targetItem.menuId;
    this.spinner.show(); 
  }
  copyItemToMenu(targetItem, recForCopyCut) {
    this.spinner.show();
    this.noteService.addItem([{ pId: targetItem.menuId, content: 'copy of: ' + recForCopyCut.content, orderId: this.noteList.length }])
      .subscribe(
        res => {
          this.spinner.hide();
          this.getItems();
        });
  }
  cutItemToMenu(targetItem, recForCopyCut) {
    let item: Item = new Item();
    item.itemId = recForCopyCut.itemId;
    item.content = recForCopyCut.content;
    item.pId = targetItem.menuId;
    this.spinner.show();
    this.noteService.editItem(item).subscribe(res => {
      this.spinner.hide();
      this.getItems();
    });
  }
  deleteMenuOrNote(targetItem, recType) {
    if (recType == 'menu') {
      this.deleteNode(targetItem.key)
    } else {
      this.deleteItem(targetItem);
    }
  }
  editMenuData: Menu = new Menu();
  editItemData: Item = new Item();
  editItemVisible: boolean = false;
  editMenuVisible: boolean = false;
  openEdotDialog(record, type): void {
    if (type == 'menu') {
      this.editMenuData = Object.assign({}, record);
      this.editMenuVisible = true;
    } else {
      this.editItemData = Object.assign({}, record);
      this.editItemVisible = true;
    }
  }
  saveMenuRecord() {
    this.editItemVisible = false;
    this.editMenuVisible = false;
    this.editFile(this.editMenuData);
  }
  saveItemRecord() {
    this.editItemVisible = false;
    this.editMenuVisible = false;
    this.editItem(this.editItemData);
  }
  deleteItem(item) {
    this.spinner.show();
    this.noteService.delItem(item.itemId).subscribe(
      res => {
        let index = this.noteList.findIndex(note => note.itemId === item.itemId);
        if(index > -1) {
          this.noteList.splice(index, 1);
          this.updateItemSortOrder();
        }
        this.spinner.hide();
        this.getItems();
      });
  }
  deleteNode(key) {
    this.spinner.show();
    this.note2Service.delFile(key).subscribe(
      res => {
        let index =  this.dataSource.data.findIndex(node => node.menuId === key);
        if(index > -1) {
          this.dataSource.data.splice(index, 1);
          this.updateFolderSortOrder();
        }
        this.spinner.hide();
        this.getMenuList();
        this.msgService.success(this.getTranslationString('notepad.noteDelete', ''));
      }, error => {
        this.spinner.hide();
        this.msgService.warning(this.getTranslationString('notepad.noteDeleteFail', ''));
        this.getMenuList();
      }
    );
  }
  getTranslationString(key: string, params: Object): string {
    let str: string;
    this.translate.get(key, params).subscribe((res: string) => {
      str = res;
    });
    return str;
  }
} 
