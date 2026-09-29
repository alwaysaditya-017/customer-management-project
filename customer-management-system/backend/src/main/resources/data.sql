INSERT INTO customers (name,email,phone_number,company,status)
VALUES
('Aditya Dash','aditya@gmail.com','+91 9876543210','Acme Corp','ACTIVE')
ON CONFLICT (email) DO NOTHING;
