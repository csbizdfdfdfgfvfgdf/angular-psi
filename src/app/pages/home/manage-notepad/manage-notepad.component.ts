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
import { threadId } from 'worker_threads';

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
// this component is used to manage notes and folders
@Component({
  selector: 'app-manage-notepad',
  templateUrl: './manage-notepad.component.html',
  styleUrls: ['./manage-notepad.component.less']
})

export class ManageNotepadComponent implements OnInit, AfterViewInit, OnDestroy {
  // component variables or local veriables 
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

  // constructor for this class which is used to initilise this class
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

  // this method call on when class initization done
  ngOnInit(): void {
    // get user if already login 
    this.getUser();

    // adding local languages this time we have just two languages
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

  // this event called when try to change language 
  switchLang(lang: string) {
    this.translate.use(lang);
    localStorage.removeItem('lang');
    localStorage.setItem('lang', lang);
  }

  // when dom (view) page initilization done it will be called
  // in this method we are subscribing an event for saving items and notes
  // it will immigiately add note or folder with out waiting user to server response 
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

  // when drag started
  dragStarted(item: any) {
    this.dragingItem = item;
  }

  // when drop note or folder
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.dragingItem.orderId = event.currentIndex;
      // this is build in method for tree draging
      moveItemInArray(this.noteList, event.previousIndex, event.currentIndex);
      // refreshing data after draging droping
      this.updateItemSortOrder();
    } else {
    }
  }

// when droping folders from tree into itself
  dropTree(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      this.spinner.show();
      if(this.dragingMenu) {
        this.dragingMenu.orderId = event.currentIndex;
      }
      // this is build in method for tree draging
      moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
      // refreshing data after draging droping
      this.updateFolderSortOrder();
    } else {
    }

  }

  // when drag and drop items this method will update their orders
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
// when draging folder started 
  dragFolderStarted(menu) {
    this.dragingMenu = menu;
  }

  // when drag and drop folder this method will update their orders
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
    });
    this.dataSource.data = updatedData;
    this.updateMenuSort(updatedData);
  }

  dragStartedOld(item: any, i: number, dragEl: HTMLElement) {
    this.spinner.show();
    this.noteService.dragSubject.next({ item, index: i });
  }

  // these methods are not being used any where currenly 
  startEdit(id: string) {
    this.editId = id;
  }
  stopEdit(item) {
    this.editId = null;
    this.editItem(item);
  }

  // when editing items from context menu
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

  // when editing folder from context menu
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

  // getting all folders for current user
  getMenuList(key?: string) {
    this.noteService.getMenus().subscribe(res => {
      this.isUserAlreadyExist = true;
      this.treeMenu = [];
      this.dataSource = new MatTreeNestedDataSource<TreeNodeData>();
      this.selectedNode = null;
      if (res) {
        this.folderList = res;
        // this linear response will be convert to tree validated object
        this.makeTreeData(res);
      }
    }, (error) => {
      this.spinner.hide();
    });
  }

  // will get input of linear data and will return tree structed object
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

  // will get current user it will check if user is visitor or properly registered
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

  // refreshed folder list after having operation on its list ( delete,drag drop or add)
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

  // for those user who not registered s uuid is generated on server side this will get that uuid 
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

  // for root users when any one save folder and that user is not registered then a uuid is generated on server side
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

  // when adding note into any folders or root level on submit button clicked this event called
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

  // for first time when any one try to save record it check if user already exists or not
  //  if user does not exists then it will make a uuid for that user to save records
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

  // for addig note into root level
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

  // this will get all items by selected folder id
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

  // this will get all notes on root level
  getRootNOte() {
    this.selectedNode = null;
    this.activeNode = null;
    this.getItemsByUserId();
  }
  
  // this will get all notes on root level for current user
  getItemsByUserId() {
    this.noteService.getItemsByUser().subscribe(
      (res: Item[]) => {
        this.noteList = res.sort((a, b) => a.orderId - b.orderId);
      }, (error) => {
        console.log(error);
      });
  }

  // when updating sorting ( drag drop items)
  updateItemSort(tmpnode) {
    this.noteService.updateItemSort_gen(tmpnode).subscribe(
      res => {
        this.getItems();
      }, (error) => {
      });
  }

  // to update the sort order of side menu
  updateMenuSort(tmpnode) {
    this.note2Service.updateMenuSort_gen(tmpnode).subscribe(res => {
      this.getMenuList();
    });
  }

  // these methods are not being used this time
  copy(item) {
  }
  cut(item) {
  }
  paste(item) {
  }
  setMoveItem() {
  }

  //===================add edit delete folder functionality started here =================

  // open modal windo to take folder name
  showModal(): void {
    this.Visible = true;
  }

  // for first time when any one try to save record it check if user already exists or not
  //  if user does not exists then it will make a uuid for that user to save records
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

  // when save button clicked on modal window to save folder
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

  // cancel button clicked on modal window for adding folder
  handleCancel(): void {
    this.Visible = false;
  }

  // will open modal window to add folder
  add(e, key) {
    e.stopPropagation();
    this.addFileItem.pId = this.pId = key;
    this.addFile();
  }
  addFile() {
    this.showModal();
  }

  // for adding folder into folder or on root level
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
  // when right clicked on right side to open context menu  
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

  // when left side clicked to open context menu
  onContextMenu(event: MouseEvent, item: any, recType: any) {
    event.preventDefault();
    this.contextMenus = this.generalcontextMenus;
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item, 'recType': recType };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  } 
  
  // when clicked on any context menu 
  // there is switch statement to check which menu clicked and then perform operation 
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

  // when paste option clicked from contet menu
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
      if(this.noteList && this.noteList.length>0 && this.noteList[0].pId === this.recForCopyCut.pId) {
        moveItemInArray(this.noteList, this.recForCopyCut.orderId, targetItem.orderId);
      }else {
        this.recForCopyCut.pId = targetItem.menuId;
        this.noteList.splice(targetItem.orderId, 0 , this.recForCopyCut);
      }
      this.updateItemSortOrder();
    }
  }

  // when pasting menu or folder
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
        // default method of mat-tree to moving data into tree
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

  // when copy menu clicked from context menu
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

  // when cut menu clicked from context menu
  cutMenuToMenu(targetItem, recForCopyCut) {
    let menu: Menu = new Menu();
    menu.menuId = recForCopyCut.menuId;
    menu.orderId = recForCopyCut.orderId;
    menu.pId = targetItem.menuId;
    this.spinner.show(); 
  }
  
  // when copy note clicked from contet menu
  copyItemToMenu(targetItem, recForCopyCut) {
    this.spinner.show();
    this.noteService.addItem([{ pId: targetItem.menuId, content: 'copy of: ' + recForCopyCut.content, orderId: this.noteList.length }])
      .subscribe(
        res => {
          this.spinner.hide();
          this.getItems();
        });
  }

  // when copy note into folder context menu clicked
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

  // when delete option clicked from context menu of folder or notes
  deleteMenuOrNote(targetItem, recType) {
    if (recType == 'menu') {
      this.deleteNode(targetItem.key)
    } else {
      this.deleteItem(targetItem);
    }
  }

  // local variable for editing folders or notes
  editMenuData: Menu = new Menu();
  editItemData: Item = new Item();
  editItemVisible: boolean = false;
  editMenuVisible: boolean = false;

  // this will open a modal window for editing folder or notes
  openEdotDialog(record, type): void {
    if (type == 'menu') {
      this.editMenuData = Object.assign({}, record);
      this.editMenuVisible = true;
    } else {
      this.editItemData = Object.assign({}, record);
      this.editItemVisible = true;
    }
  }

  // from modal window save clicked event for folder
  saveMenuRecord() {
    this.editItemVisible = false;
    this.editMenuVisible = false;
    this.editFile(this.editMenuData);
  }

  // from modal window save clicked event for notes
  saveItemRecord() {
    this.editItemVisible = false;
    this.editMenuVisible = false;
    this.editItem(this.editItemData);
  }

  // delete option clicked for notes from context menu
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

  // this method is used to remove node from tree. not having any server call just on ui side
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

  // it will translate string to selected language
  getTranslationString(key: string, params: Object): string {
    let str: string;
    this.translate.get(key, params).subscribe((res: string) => {
      str = res;
    });
    return str;
  }
} 
