export class Api {

    /** 权限接口  **/
    static register = 'register'; // 注册接口
    static login = 'authenticate'; // 登陆接口
    static me = 'auth/me'; // 获取用户信息
    static logout = 'auth/logout'; //退出
    static makeUuid = 'auth/makeUuid'; //获取UUID
    static retrievePwd = 'auth/retrievePwd'; // 邮件找回密码
    static resetPwd = 'auth/resetPwd'; // 重置

    /** 业务接口  **/
    static menuList = 'menus'; // 显示网站内容
    static addItem = 'api/menu/addItem'; // 添加子节点
    static menuItem = 'api/menu/menuItem'; // 获取父节点下的所有节点
    static menuItemByUser = 'api/menu/menuItemByUser'; // 获取父节点下的所有节点
    static updateItem = 'api/menu/updateItem'; //更新子节点
    static updateMenu = 'api/menu/updateMenu'; // 更新菜单内容
    static delItem = 'api/menu/delItem'; // 删除节点
    static moveItem = 'api/menu/moveItem'; // 移动节点
    static updateItemSort = 'api/menu/updateItem'; // 修改子节点排序
    static updateMenuSort = 'api/menu/updateMenu'; // 修改文件夹节点排序
    static addMenu = 'api/menu/addMenu'; // 新增父节点
    static delMenu = 'api/menu/delMenu'; // 删除父节点
}

