-- =========================================
-- BINATHAR MOTORS
-- CLEAN DATABASE SETUP
-- =========================================
-- Remove old tables if they exist
DROP TABLE IF EXISTS bike_edit_history;

DROP TABLE IF EXISTS inquiries;

DROP TABLE IF EXISTS sales;

DROP TABLE IF EXISTS bike_images;

DROP TABLE IF EXISTS bikes;

DROP TABLE IF EXISTS business_phones;

DROP TABLE IF EXISTS users;

-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
    id            SERIAL        PRIMARY KEY,
    name          VARCHAR (150) NOT NULL,
    username      VARCHAR (50)  UNIQUE NOT NULL,
    email         VARCHAR (255) UNIQUE NOT NULL,
    password_hash VARCHAR (255),
    role          VARCHAR (20)  DEFAULT 'staff',
    status        VARCHAR (20)  DEFAULT 'pending',
    last_login    TIMESTAMP,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BIKES
-- =========================================
CREATE TABLE bikes (
    id                SERIAL          PRIMARY KEY,
    brand             VARCHAR (50)    NOT NULL,
    model             VARCHAR (100)   NOT NULL,
    model_year        INT             NOT NULL,
    selling_price     NUMERIC (12, 2) NOT NULL,
    color             VARCHAR (50)   ,
    engine_cc         INT            ,
    registration_city VARCHAR (100)  ,
    condition         VARCHAR (20)    NOT NULL,
    description       TEXT           ,
    status            VARCHAR (20)    DEFAULT 'available',
    created_by        INT             FOREIGN KEY REFERENCES users (id),
    updated_by        INT             FOREIGN KEY REFERENCES users (id),
    created_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BIKE IMAGES
-- =========================================
CREATE TABLE bike_images (
    id         SERIAL    PRIMARY KEY,
    bike_id    INT       NOT NULL FOREIGN KEY REFERENCES bikes (id) ON DELETE CASCADE,
    image_url  TEXT      NOT NULL,
    is_cover   BOOLEAN   DEFAULT FALSE,
    sort_order INT       DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- SALES
-- =========================================
CREATE TABLE sales (
    id             SERIAL          PRIMARY KEY,
    bike_id        INT             NOT NULL FOREIGN KEY REFERENCES bikes (id),
    purchase_price NUMERIC (12, 2) NOT NULL,
    sale_price     NUMERIC (12, 2) NOT NULL,
    sale_date      DATE            DEFAULT CURRENT_DATE,
    customer_name  VARCHAR (150)  ,
    customer_phone VARCHAR (50)   ,
    created_by     INT             FOREIGN KEY REFERENCES users (id),
    created_at     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BIKE EDIT HISTORY
-- =========================================
CREATE TABLE bike_edit_history (
    id        SERIAL       PRIMARY KEY,
    bike_id   INT          NOT NULL FOREIGN KEY REFERENCES bikes (id) ON DELETE CASCADE,
    edited_by INT          FOREIGN KEY REFERENCES users (id),
    action    VARCHAR (50),
    changes   JSONB       ,
    edited_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- CUSTOMER INQUIRIES
-- =========================================
CREATE TABLE inquiries (
    id             SERIAL        PRIMARY KEY,
    bike_id        INT           FOREIGN KEY REFERENCES bikes (id) ON DELETE SET NULL,
    customer_name  VARCHAR (150),
    customer_phone VARCHAR (50) ,
    message        TEXT         ,
    status         VARCHAR (20)  DEFAULT 'new',
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- BUSINESS PHONE NUMBERS
-- =========================================
CREATE TABLE business_phones (
    id              SERIAL        PRIMARY KEY,
    phone_number    VARCHAR (50)  NOT NULL,
    whatsapp_number VARCHAR (50) ,
    label           VARCHAR (100),
    is_primary      BOOLEAN       DEFAULT FALSE,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- INDEXES
-- =========================================
CREATE INDEX idx_bikes_status
    ON bikes(status);

CREATE INDEX idx_bikes_brand
    ON bikes(brand);

CREATE INDEX idx_bikes_model
    ON bikes(model);

CREATE INDEX idx_bikes_year
    ON bikes(model_year);

CREATE INDEX idx_sales_bike
    ON sales(bike_id);

CREATE INDEX idx_inquiries_status
    ON inquiries(status);

-- =========================================
-- CUSTOMER REVIEWS
-- =========================================
CREATE TABLE reviews (
    id             SERIAL        PRIMARY KEY,
    customer_name  VARCHAR (150) NOT NULL,
    rating         INT           NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text    TEXT          NOT NULL,
    bike_id        INT           REFERENCES bikes (id) ON DELETE SET NULL,
    status         VARCHAR (20)  DEFAULT 'pending',
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_status
    ON reviews(status);

CREATE INDEX idx_reviews_bike
    ON reviews(bike_id);