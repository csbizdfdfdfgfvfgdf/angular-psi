export class ApiRes {
  msg: string;
  msgCode: string;
  data: any;
}

interface User {
  name: string;
  age: number;
}

const user = {
  name: 'Jack',
  age: 123
};

class SomeClass {

  /**
   * 注释 1
   */
  public test(para: User): number;
  /**
   * 注释 2
   */
  public test(para: number, flag: boolean): number;
  public test(para: User | number, flag?: boolean): number {
    // 具体实现
    return 11;
  }
}

const someClass = new SomeClass();


// ok
someClass.test(user);
someClass.test(123, false);
