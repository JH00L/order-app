// 메뉴 데이터
export const menuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '깔끔하고 시원한 아이스 아메리카노',
    image: 'https://picsum.photos/seed/coffee1/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '깊고 진한 핫 아메리카노',
    image: 'https://picsum.photos/seed/coffee2/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유와 에스프레소의 조화',
    image: 'https://picsum.photos/seed/coffee3/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 4,
    name: '바닐라라떼',
    price: 5500,
    description: '달콤한 바닐라 향이 가득한 라떼',
    image: 'https://picsum.photos/seed/coffee4/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 5,
    name: '카라멜마끼아또',
    price: 6000,
    description: '카라멜 드리즐이 올라간 달콤한 마끼아또',
    image: 'https://picsum.photos/seed/coffee5/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 6,
    name: '카푸치노',
    price: 5000,
    description: '풍성한 우유 거품이 특징인 카푸치노',
    image: 'https://picsum.photos/seed/coffee6/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
]

// 초기 재고 데이터 (모든 메뉴 포함)
export const initialInventory = menuData.map((menu) => ({
  id: menu.id,
  name: menu.name,
  stock: 10,
}))
