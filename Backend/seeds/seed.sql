-- USERS
INSERT INTO users (name, email, password, role)
VALUES
('Rahul Sharma', 'rahul@gmail.com', 'password123', 'user'),
('Arjun Verma', 'arjun@gmail.com', 'password456', 'user'),
('Priya Singh', 'priya@gmail.com', 'password789', 'user'),
('Aman Patel', 'aman@gmail.com', 'password111', 'user'),
('Admin User', 'admin@gmail.com', 'admin123', 'admin');


-- VENUES
INSERT INTO venues (name, location)
VALUES
('DB City Mall Auditorium', 'Bhopal'),
('Phoenix Arena', 'Indore'),
('Jawaharlal Nehru Stadium', 'Delhi');


-- EVENTS
INSERT INTO events (venue_id, name, description, start_time)
VALUES
(1, 'Rock Night',
 'Live rock music concert',
 '2026-11-15 19:00:00'),

(1, 'Tech Conference 2026',
 'Technology and innovation conference',
 '2026-11-20 10:00:00'),

(2, 'Standup Comedy Night',
 'A night of standup comedy',
 '2026-11-25 20:00:00'),

(3, 'Football Final',
 'College football championship final',
 '2026-12-01 18:00:00');


-- SEATS
INSERT INTO seats (venue_id, seat_number)
VALUES
(1, 'A1'),
(1, 'A2'),
(1, 'A3'),
(1, 'A4'),
(1, 'B1'),
(1, 'B2'),

(2, 'A1'),
(2, 'A2'),
(2, 'A3'),
(2, 'B1'),
(2, 'B2'),

(3, 'A1'),
(3, 'A2'),
(3, 'A3'),
(3, 'A4');


-- EVENT SEATS
INSERT INTO event_seats (event_id, seat_id, status)
VALUES
-- Rock Night
(1, 1, 'available'),
(1, 2, 'booked'),
(1, 3, 'available'),
(1, 4, 'available'),
(1, 5, 'booked'),
(1, 6, 'available'),

-- Tech Conference
(2, 1, 'available'),
(2, 2, 'available'),
(2, 3, 'booked'),
(2, 4, 'available'),
(2, 5, 'available'),
(2, 6, 'available'),

-- Standup Comedy
(3, 7, 'available'),
(3, 8, 'booked'),
(3, 9, 'available'),
(3, 10, 'available'),
(3, 11, 'available'),

-- Football Final
(4, 12, 'booked'),
(4, 13, 'available'),
(4, 14, 'available'),
(4, 15, 'available');


-- BOOKINGS
INSERT INTO bookings (user_id, event_seat_id, status)
VALUES
(1, 2, 'confirmed'),
(2, 5, 'confirmed'),
(3, 9, 'confirmed'),
(4, 12, 'confirmed');