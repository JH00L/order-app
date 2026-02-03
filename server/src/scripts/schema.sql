-- 커피 주문 앱 데이터베이스 스키마
-- PostgreSQL

-- 기존 테이블 삭제 (개발용)
DROP TABLE IF EXISTS order_item_options CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS options CASCADE;
DROP TABLE IF EXISTS menus CASCADE;

-- Menus 테이블
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    image VARCHAR(255),
    stock INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Options 테이블
CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders 테이블
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    total_amount INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order_Items 테이블
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_id INTEGER REFERENCES menus(id) ON DELETE SET NULL,
    menu_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price INTEGER NOT NULL,
    subtotal INTEGER NOT NULL
);

-- Order_Item_Options 테이블
CREATE TABLE order_item_options (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
    option_id INTEGER REFERENCES options(id) ON DELETE SET NULL,
    option_name VARCHAR(100) NOT NULL,
    option_price INTEGER NOT NULL
);

-- 인덱스 생성
CREATE INDEX idx_options_menu_id ON options(menu_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_item_options_order_item_id ON order_item_options(order_item_id);

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입
INSERT INTO menus (name, description, price, image, stock) VALUES
    ('아메리카노(ICE)', '깔끔하고 시원한 아이스 아메리카노', 4000, 'https://picsum.photos/200/200?random=1', 50),
    ('아메리카노(HOT)', '깊고 진한 핫 아메리카노', 4000, 'https://picsum.photos/200/200?random=2', 50),
    ('카페라떼(ICE)', '부드러운 우유와 에스프레소의 조화', 5000, 'https://picsum.photos/200/200?random=3', 30),
    ('카페라떼(HOT)', '따뜻하고 부드러운 카페라떼', 5000, 'https://picsum.photos/200/200?random=4', 30),
    ('바닐라라떼(ICE)', '달콤한 바닐라 향이 가득한 라떼', 5500, 'https://picsum.photos/200/200?random=5', 25),
    ('카라멜마끼아또', '카라멜 시럽과 에스프레소의 달콤한 만남', 5500, 'https://picsum.photos/200/200?random=6', 25);

-- 옵션 데이터 삽입
INSERT INTO options (menu_id, name, price) VALUES
    (1, '샷 추가', 500),
    (1, '시럽 추가', 0),
    (2, '샷 추가', 500),
    (2, '시럽 추가', 0),
    (3, '샷 추가', 500),
    (3, '휘핑크림 추가', 500),
    (4, '샷 추가', 500),
    (4, '휘핑크림 추가', 500),
    (5, '샷 추가', 500),
    (5, '바닐라 시럽 추가', 0),
    (6, '샷 추가', 500),
    (6, '카라멜 시럽 추가', 0);

-- 확인 메시지
SELECT '스키마 생성 및 샘플 데이터 삽입 완료!' AS message;
