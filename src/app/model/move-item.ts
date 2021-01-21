export class MoveItem {
    mid: number; // 父节点ID
    itemid: number; // 子节点id
    // tslint:disable-next-line:variable-name
    drag_file = 'true'; // true 拖拽的是父节点 false 拖拽的是子节点 固定值为true
    // tslint:disable-next-line:variable-name
    is_catalog = 3; // 1、把子节点变成父节点，是在父节点新增（这个功能只在移动端适用，在web端不行）固定值为3
}
