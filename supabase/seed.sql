-- ==============================================================================
-- CampusConnect Seed Data
-- 6 Karnataka Colleges, 20+ Students, 25+ Listings, 10+ Events, 8+ Tutors,
-- 8+ Communities, 6+ Projects, Demo Student & Demo Admin Accounts
-- ==============================================================================

-- 1. SEED COLLEGES
INSERT INTO public.colleges (id, name, short_name, city, domain, logo_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Vidyavardhaka College of Engineering', 'VVCE', 'Mysuru', 'vvce.ac.in', 'https://images.unsplash.com/photo-1562774053-701939374585?w=128&q=80'),
('22222222-2222-2222-2222-222222222222', 'R.V. College of Engineering', 'RVCE', 'Bengaluru', 'rvce.edu.in', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&q=80'),
('33333333-3333-3333-3333-333333333333', 'B.M.S. College of Engineering', 'BMSCE', 'Bengaluru', 'bmsce.ac.in', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=128&q=80'),
('44444444-4444-4444-4444-444444444444', 'Ramaiah Institute of Technology', 'MSRIT', 'Bengaluru', 'msrit.edu', 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&q=80'),
('55555555-5555-5555-5555-555555555555', 'PES University', 'PESU', 'Bengaluru', 'pes.edu', 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=128&q=80'),
('66666666-6666-6666-6666-666666666666', 'National Institute of Technology Karnataka', 'NITK', 'Surathkal', 'nitk.edu.in', 'https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=128&q=80')
ON CONFLICT (domain) DO UPDATE SET name = EXCLUDED.name;

-- 2. SEED PROFILES
-- Demo Student (VVCE)
INSERT INTO public.profiles (
    id, full_name, email, usn, college_id, branch, year, bio, avatar_url,
    interests, skills, role, is_verified, is_suspended, phone, show_phone, show_email
) VALUES
('a0000000-0000-0000-0000-000000000001', 'Darshan Gowda', 'demo-student@vvce.ac.in', '4VV21CS042', '11111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 3, 'Pre-final year CSE student passionate about Full Stack, Web3, and Open Source in Karnataka tech communities.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&q=80', ARRAY['Full Stack', 'Cloud Computing', 'Hackathons', 'GATE'], ARRAY['Next.js', 'PostgreSQL', 'TypeScript', 'Docker', 'Python'], 'student', true, false, '+91 98450 12345', true, true),

-- Demo Admin (VVCE)
('a0000000-0000-0000-0000-000000000002', 'Prof. Anitha Sharma', 'demo-admin@vvce.ac.in', 'FAC-VVCE-09', '11111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 4, 'CampusConnect Administrator & Faculty Advisor for Student Innovation and Clubs at VVCE.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&q=80', ARRAY['Mentorship', 'Accreditation', 'Student Affairs'], ARRAY['Curriculum', 'System Architecture', 'Governance'], 'admin', true, false, '+91 98450 99999', true, true),

-- Student 3 (RVCE Tutor)
('a0000000-0000-0000-0000-000000000003', 'Rohan Kumar', 'rohan.k@rvce.edu.in', '1RV21IS088', '22222222-2222-2222-2222-222222222222', 'Information Science & Engineering', 4, 'Solved 800+ LeetCode problems. ICPC Regionalist, teaching DSA and System Design.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&q=80', ARRAY['Algorithms', 'Competitive Programming', 'System Design'], ARRAY['C++', 'Java', 'Data Structures', 'Algorithms'], 'student', true, false, '+91 94481 22334', false, true),

-- Student 4 (BMSCE Tutor)
('a0000000-0000-0000-0000-000000000004', 'Aishwarya M', 'aishwarya.m@bmsce.ac.in', '1BM22EC015', '33333333-3333-3333-3333-333333333333', 'Electronics & Communication', 3, 'Specializing in Signals, Systems, and Engineering Mathematics. 9.4 CGPA.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&q=80', ARRAY['Mathematics', 'Signal Processing', 'GATE ECE'], ARRAY['Linear Algebra', 'Calculus', 'MATLAB', 'Verilog'], 'student', true, false, '+91 97412 33445', false, true),

-- Student 5 (PESU Tutor)
('a0000000-0000-0000-0000-000000000005', 'Rahul S', 'rahul.s@pes.edu', 'PES1UG21CS245', '55555555-5555-5555-5555-555555555555', 'Artificial Intelligence & Machine Learning', 4, 'Research intern at IISc Bangalore. Passionate about Deep Learning and GenAI.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80', ARRAY['Machine Learning', 'Computer Vision', 'LLMs'], ARRAY['PyTorch', 'TensorFlow', 'Python', 'Scikit-Learn'], 'student', true, false, '+91 98860 44556', false, true),

-- Student 6 (NITK Tutor)
('a0000000-0000-0000-0000-000000000006', 'Sneha Rao', 'sneha.rao@nitk.edu.in', '211EC142', '66666666-6666-6666-6666-666666666666', 'Electronics & Communication', 3, 'Surathkal beach lover & hardware hacker. Microcontrollers, Embedded Systems & IoT tutor.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&q=80', ARRAY['IoT', 'Embedded Systems', 'Robotics'], ARRAY['Arduino', 'ESP32', 'C', 'RTOS', 'KiCAD'], 'student', true, false, '+91 99001 55667', true, true),

-- Student 7 (MSRIT)
('a0000000-0000-0000-0000-000000000007', 'Chandan Bhat', 'chandan.b@msrit.edu', '1MS21ME032', '44444444-4444-4444-4444-444444444444', 'Mechanical Engineering', 4, 'Formula Student racer, CAD/CAM specialist, 3D printing enthusiast.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&q=80', ARRAY['Automotive', 'Robotics', 'Additive Manufacturing'], ARRAY['SolidWorks', 'ANSYS', 'AutoCAD'], 'student', true, false, '+91 94480 66778', false, true),

-- Student 8 (VVCE)
('a0000000-0000-0000-0000-000000000008', 'Kavya Hegde', 'kavya.h@vvce.ac.in', '4VV22IS029', '11111111-1111-1111-1111-111111111111', 'Information Science', 2, 'UI/UX Designer and Frontend developer. Leads VVCE Google Developer Group design team.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&q=80', ARRAY['UI/UX Design', 'Product Design', 'Figma'], ARRAY['Figma', 'CSS/Tailwind', 'React', 'Prototyping'], 'student', true, false, '+91 98451 77889', false, true),

-- Student 9 (RVCE)
('a0000000-0000-0000-0000-000000000009', 'Naveen Prashanth', 'naveen.p@rvce.edu.in', '1RV22CS110', '22222222-2222-2222-2222-222222222222', 'Computer Science', 2, 'Cybersecurity enthusiast, CTF player, and Linux kernel explorer.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&q=80', ARRAY['Cybersecurity', 'Networks', 'Cloud'], ARRAY['Linux', 'Wireshark', 'Python', 'Rust'], 'student', true, false, '+91 96112 88990', false, true),

-- Student 10 (BMSCE)
('a0000000-0000-0000-0000-000000000010', 'Pooja Kashyap', 'pooja.k@bmsce.ac.in', '1BM21CS140', '33333333-3333-3333-3333-333333333333', 'Computer Science', 4, 'Incoming SDE at Cisco Bengaluru. Enjoys helping juniors ace technical interviews.', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&q=80', ARRAY['Career Prep', 'Interviewing', 'Databases'], ARRAY['Java', 'SQL', 'Spring Boot', 'AWS'], 'student', true, false, '+91 97310 99001', false, true),

-- Student 11 (PESU)
('a0000000-0000-0000-0000-000000000011', 'Vikram Aditya', 'vikram.a@pes.edu', 'PES1UG22EC102', '55555555-5555-5555-5555-555555555555', 'Electronics & Communication', 2, 'FPGA enthusiast and VLSI hobbyist. Member of PES University Satellite Team.', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&q=80', ARRAY['Space Tech', 'VLSI', 'Robotics'], ARRAY['Verilog', 'SystemVerilog', 'C++'], 'student', true, false, '+91 98800 11223', false, true),

-- Student 12 (NITK)
('a0000000-0000-0000-0000-000000000012', 'Meghana Shetty', 'meghana.s@nitk.edu.in', '211IT220', '66666666-6666-6666-6666-666666666666', 'Information Technology', 3, 'DevOps practitioner and open-source contributor. NITK HackVerse Organizer.', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=256&q=80', ARRAY['DevOps', 'Cloud Native', 'Kubernetes'], ARRAY['Go', 'Kubernetes', 'Terraform', 'CI/CD'], 'student', true, false, '+91 99011 22334', false, true),

-- Student 13 (MSRIT)
('a0000000-0000-0000-0000-000000000013', 'Girish Kulkarni', 'girish.k@msrit.edu', '1MS22CS055', '44444444-4444-4444-4444-444444444444', 'Computer Science', 2, 'Mobile app builder with Flutter and React Native. Built apps with 10k+ downloads.', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=256&q=80', ARRAY['Mobile Dev', 'Startups', 'Fintech'], ARRAY['Flutter', 'Dart', 'React Native', 'Firebase'], 'student', true, false, '+91 94490 33445', false, true),

-- Student 14 (VVCE)
('a0000000-0000-0000-0000-000000000014', 'Tejaswini Bhat', 'teju.b@vvce.ac.in', '4VV21CV012', '11111111-1111-1111-1111-111111111111', 'Civil Engineering', 3, 'GIS and Remote Sensing enthusiast. Sustainable urban planning researcher in Mysuru.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&q=80', ARRAY['Sustainability', 'GIS', 'Smart Cities'], ARRAY['QGIS', 'AutoCAD', 'Surveying'], 'student', true, false, '+91 98452 44556', false, true),

-- Student 15 (RVCE)
('a0000000-0000-0000-0000-000000000015', 'Aditya Somayaji', 'aditya.s@rvce.edu.in', '1RV21AI004', '22222222-2222-2222-2222-222222222222', 'Artificial Intelligence & Data Science', 3, 'Working on Kannada Speech recognition & Kannada NLP models.', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=256&q=80', ARRAY['NLP', 'Kannada Tech', 'Machine Learning'], ARRAY['PyTorch', 'Hugging Face', 'FastAPI'], 'student', true, false, '+91 96110 55667', false, true)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED TUTORS
INSERT INTO public.tutors (user_id, subjects, hourly_rate, mode, bio, rating_avg, rating_count) VALUES
('a0000000-0000-0000-0000-000000000003', ARRAY['Data Structures & Algorithms', 'C++', 'System Design', 'Competitive Programming'], 450.00, 'both', 'Guided 50+ students in cracking FAANG & Tier-1 company tech rounds. Clear conceptual explanations.', 4.95, 38),
('a0000000-0000-0000-0000-000000000004', ARRAY['Engineering Mathematics (M1/M2/M3)', 'Linear Algebra', 'Digital Signal Processing'], 350.00, 'online', 'Step-by-step problem solving for VTU and autonomous syllabi. High pass rate guaranteed.', 4.90, 42),
('a0000000-0000-0000-0000-000000000005', ARRAY['Machine Learning Fundamentals', 'Deep Learning with PyTorch', 'Python for Data Science'], 500.00, 'both', 'Learn by coding real projects from scratch. IISc research intern.', 4.88, 29),
('a0000000-0000-0000-0000-000000000006', ARRAY['Microcontrollers & Embedded C', 'Arduino & ESP32 Prototyping', 'Digital Electronics'], 400.00, 'both', 'Hands-on hardware labs, circuit design, and debugging for minor & major projects.', 4.92, 31),
('a0000000-0000-0000-0000-000000000007', ARRAY['Engineering Drawing', 'SolidWorks 3D Modeling', 'Finite Element Analysis'], 300.00, 'offline', 'Visual CAD workflows and mechanical project design guidance.', 4.75, 16),
('a0000000-0000-0000-0000-000000000010', ARRAY['Java OOPs', 'Database Management (SQL)', 'Resume & Interview Prep'], 400.00, 'online', 'Structured modules for college exams and campus placement rounds.', 4.85, 24)
ON CONFLICT (user_id) DO NOTHING;

-- Tutor Availability Slots
INSERT INTO public.tutor_availability (tutor_id, weekday, start_time, end_time) VALUES
('a0000000-0000-0000-0000-000000000003', 1, '18:00', '20:00'),
('a0000000-0000-0000-0000-000000000003', 3, '18:00', '20:00'),
('a0000000-0000-0000-0000-000000000003', 6, '14:00', '18:00'),
('a0000000-0000-0000-0000-000000000004', 2, '17:00', '19:00'),
('a0000000-0000-0000-0000-000000000004', 4, '17:00', '19:00'),
('a0000000-0000-0000-0000-000000000004', 0, '10:00', '13:00'),
('a0000000-0000-0000-0000-000000000005', 5, '18:00', '21:00'),
('a0000000-0000-0000-0000-000000000005', 6, '16:00', '19:00')
ON CONFLICT DO NOTHING;

-- 4. SEED MARKETPLACE LISTINGS
INSERT INTO public.listings (
    id, seller_id, college_id, title, description, category, condition, price, negotiable, images, status
) VALUES
('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 
 'Introduction to Algorithms (CLRS 3rd Edition)', 
 'Standard textbook for Design & Analysis of Algorithms. Pristine condition with no markings or torn pages. Must-have for VTU and autonomous college exams and GATE prep.', 
 'Books', 'Like New', 850.00, true, 
 ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 
 'Complete Engineering Mathematics handwritten notes (Sem 1-4)', 
 'Full handwritten color-coded notes with solved 10-year question papers, Fourier series, transforms, and linear algebra cheatsheets.', 
 'Notes', 'Good', 299.00, false, 
 ARRAY['https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', '66666666-6666-6666-6666-666666666666', 
 'Arduino Uno Rev3 Starter Kit with 30+ Sensors & Breadboard', 
 'Ideal for IoT and basic embedded lab mini-projects. Includes ultrasonic sensors, relay modules, OLED display, jumper wires, servo motor.', 
 'Lab Equipment', 'Like New', 1100.00, true, 
 ARRAY['https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&q=80', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000007', '44444444-4444-4444-4444-444444444444', 
 'Casio FX-991CW ClassWiz Scientific Calculator', 
 'Approved for VTU examinations. High-resolution screen, quadratic & matrix solver, QR code equation plot. 6 months old with original case.', 
 'Electronics', 'Like New', 1250.00, false, 
 ARRAY['https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 
 'Ergonomic Study Mesh Chair (Green Soul Vienna)', 
 'Breathable mesh back with adjustable lumbar support and height. Purchased for hostel study setup, moving out of Mysore.', 
 'Furniture', 'Good', 2400.00, true, 
 ARRAY['https://images.unsplash.com/photo-1580481077195-c2282388f985?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 
 'Raspberry Pi 4 Model B (4GB RAM) with Official Case & Heatsink', 
 'Used for computer vision and ROS robotic arm project. Includes 32GB high-speed SanDisk SD card pre-loaded with Ubuntu.', 
 'Electronics', 'Like New', 3800.00, false, 
 ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000007', '44444444-4444-4444-4444-444444444444', 
 'Engineering Drawing Mini-Drafter + Omega Instrument Box', 
 'Includes mini-drafter with clamp, sheet holder tube, French curves, and 0.5mm mechanical pencils. Essential for 1st year mechanical drawing.', 
 'Lab Equipment', 'Good', 650.00, true, 
 ARRAY['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000009', '22222222-2222-2222-2222-222222222222', 
 'Computer Networks by Andrew S. Tanenbaum (5th Edition)', 
 'Classic textbook covering TCP/IP protocol suite, routing protocols, and socket architecture.', 
 'Books', 'Good', 450.00, false, 
 ARRAY['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000011', '55555555-5555-5555-5555-555555555555',
 'Basys 3 Artix-7 FPGA Trainer Board',
 'Complete FPGA board for digital logic, Verilog synthesis, and computer architecture experiments. Cable and box included.',
 'Lab Equipment', 'Like New', 7500.00, true,
 ARRAY['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000013', '44444444-4444-4444-4444-444444444444',
 'Hostel Wooden Bookshelf & Organizer Rack',
 'Compact 3-tier wooden shelf, fits easily into hostel rooms. Can hold 40+ engineering books and stationeries.',
 'Furniture', 'Used', 499.00, true,
 ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
 'VTU 3rd Sem Data Structures in C (Official Lab Manual + Code)',
 'Detailed lab record with test cases, memory complexity analysis, and printouts ready for external lab exams.',
 'Notes', 'Good', 180.00, false,
 ARRAY['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111',
 'Surveying Leveling Staff & Optical Prism Kit',
 '4-meter telescopic aluminum leveling staff for Civil surveying fieldwork practicals.',
 'Lab Equipment', 'Good', 1350.00, true,
 ARRAY['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
 'Database System Concepts (Silberschatz, Korth, Sudarshan - 7th Ed)',
 'Comprehensive textbook for DBMS semester exams, SQL queries, relational calculus, transaction management, and indexing. Highlighting in only 2 chapters.',
 'Books', 'Like New', 650.00, true,
 ARRAY['https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000006', '66666666-6666-6666-6666-666666666666',
 'Digital Storage Oscilloscope DSO138 DIY Mini Kit with BNC Probe',
 'Compact oscilloscope for debugging audio circuits, PWM signals, and analog electronics lab assignments. Fully assembled, calibrated, and working.',
 'Lab Equipment', 'Like New', 1400.00, true,
 ARRAY['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
 'Operating System Concepts by Silberschatz & Galvin (9th Edition)',
 'Must-have dinosaur book for VTU 4th sem Operating Systems. Covers process scheduling, virtual memory paging, deadlock detection, and file systems.',
 'Books', 'Good', 520.00, false,
 ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000007', '44444444-4444-4444-4444-444444444444',
 'SolidWorks & AutoCAD 3D Modeling Quick Revision Guide',
 'Concise shortcut guides, GD&T symbol sheets, isometric projection charts, and VTU model question paper solutions for CAD lab exams.',
 'Notes', 'New', 199.00, false,
 ARRAY['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555',
 'Logitech MX Master 2S Wireless Bluetooth Mouse',
 'Ergonomic multi-device mouse with hyperscroll wheel. Perfect for long coding sessions and 3D modeling. Battery holds charge for 60+ days. With original Unifying receiver.',
 'Electronics', 'Like New', 3200.00, true,
 ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000010', '33333333-3333-3333-3333-333333333333',
 'GATE Computer Science 2024 Made Easy Postal Study Set (12 Books)',
 'Complete postal study set including Theory books, Practice Workbooks, and 30-year previous solved questions. Crystal clear annotations.',
 'Books', 'Good', 2800.00, true,
 ARRAY['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000009', '22222222-2222-2222-2222-222222222222',
 'Heavy Duty Folding Study Table with Cup & Tablet Holder',
 'Sturdy MDF wood top with reinforced alloy legs. Folds flat in 2 seconds to slide under a hostel bed. Ideal for late-night laptop study.',
 'Furniture', 'Good', 899.00, false,
 ARRAY['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000006', '66666666-6666-6666-6666-666666666666',
 'ESP32-CAM AI-Thinker Module with FTDI Programmer & OV2640 Lens',
 'Wireless camera development module for computer vision, face recognition, and home automation IoT projects. Brand new, tested with Arduino IDE.',
 'Electronics', 'New', 550.00, false,
 ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000007', '44444444-4444-4444-4444-444444444444',
 'Mechanical Workshop Cotton Lab Coat & Polycarbonate Safety Goggles',
 'Standard VTU-prescribed white lab coat (Size 40/L) with college patch pocket and anti-scratch safety goggles. Washed and sanitized.',
 'Lab Equipment', 'Good', 350.00, false,
 ARRAY['https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111',
 'VTU 4th Sem Design & Analysis of Algorithms Handwritten Lab Manual',
 'Verified code solutions for QuickSort, MergeSort, Dijkstra, Prim, Kruskal, Warshall, Floyd, and 0/1 Knapsack with complete execution outputs.',
 'Notes', 'Good', 150.00, false,
 ARRAY['https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000011', '55555555-5555-5555-5555-555555555555',
 'Verilog HDL: A Guide to Digital Design and Synthesis (Samir Palnitkar)',
 'Standard text for digital circuit synthesis, testbench generation, and behavioral modeling. Clear print, no binding wear.',
 'Books', 'Like New', 450.00, true,
 ARRAY['https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333',
 'Boat Rockerz 550 Over-Ear Wireless Headphones (Army Green)',
 '50mm dynamic drivers with comfortable memory foam ear cushions. Great for long study sessions in college libraries. 20 hours battery life.',
 'Electronics', 'Good', 1150.00, true,
 ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000012', '66666666-6666-6666-6666-666666666666',
 'Kryptonite Hardened Steel Bicycle U-Lock with 2 Keys',
 '13mm hardened performance steel shackle. Anti-theft bicycle lock used across NITK Surathkal campus paths. Weather resistant.',
 'Others', 'Like New', 750.00, false,
 ARRAY['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000015', '22222222-2222-2222-2222-222222222222',
 'Computer Networks & Web Technology 5-Year Solved Question Papers',
 'Year-wise solved past papers (2019-2024) with diagrams, protocol headers, HTTP status code tables, and socket programs.',
 'Notes', 'Good', 220.00, false,
 ARRAY['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555',
 'Dual Monitor Desk Arm Mount (13-27 inch, Full Motion VESA)',
 'Heavy duty C-clamp desk mount with 360 degree rotation, tilt, and swivel. Cable management clips included. Clears 60% desk space.',
 'Furniture', 'Like New', 1600.00, true,
 ARRAY['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'], 'active'),

('b0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111',
 'Yonex Muscle Power 29 Badminton Racket with Full Thermal Bag',
 'Isometric aluminum frame with high repulsion stringing (24 lbs). Used for college intramural tournaments. Grip newly replaced.',
 'Others', 'Good', 1250.00, true,
 ARRAY['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80'], 'active')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED EVENTS
INSERT INTO public.events (
    id, organizer_id, college_id, title, description, type, level,
    venue, city, start_at, end_at, capacity, registration_deadline, poster_url, status
) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
 'Karnataka Student Hackathon 2025: Innovate for Bharat',
 'A 36-hour flagship inter-college hackathon focusing on AI for Vernacular India, Agritech in Cauvery basin, and Smart Mobility. Over ₹1,50,000 in cash prizes, mentorship from Bengaluru startup founders, and job interview fast-tracks.',
 'Hackathons', 'state', 'Sir M. Visvesvaraya Auditorium & Innovation Labs, VVCE', 'Mysuru',
 NOW() + INTERVAL '12 days', NOW() + INTERVAL '14 days', 300, NOW() + INTERVAL '10 days',
 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80', 'approved'),

('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222',
 'AI & Future of Work: GenAI & LLM Summit',
 'Technical deep dive into building RAG applications with LangChain, LlamaIndex, and open-weights models. Hands-on workshop with cloud compute credits sponsored by Google Cloud.',
 'Tech', 'college', 'IEM Auditorium, RVCE Campus, Mysore Road', 'Bengaluru',
 NOW() + INTERVAL '6 days', NOW() + INTERVAL '7 days', 200, NOW() + INTERVAL '5 days',
 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80', 'approved'),

('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333',
 'Utsav 2025: Inter-Collegiate Cultural Extravaganza',
 'Karnataka''s largest student cultural festival featuring battle of the bands, classical fusion, street play, pro-shows, and traditional folk arts.',
 'Cultural', 'state', 'Main Grounds & Amphitheatre, BMSCE', 'Bengaluru',
 NOW() + INTERVAL '25 days', NOW() + INTERVAL '27 days', 1500, NOW() + INTERVAL '20 days',
 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80', 'approved'),

('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000010', '33333333-3333-3333-3333-333333333333',
 'Career Guidance & Placements Masterclass 2025',
 'Master technical interviews, system design rounds, and HR behavioral questions with engineers from Cisco, Microsoft, and Zerodha.',
 'Workshops', 'college', 'Seminar Hall 3, BMSCE', 'Bengaluru',
 NOW() + INTERVAL '4 days', NOW() + INTERVAL '4 days 4 hours', 150, NOW() + INTERVAL '3 days',
 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80', 'approved'),

('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000006', '66666666-6666-6666-6666-666666666666',
 'Beachside Robotics & Autonomous Rover Challenge',
 'Design and test autonomous rovers navigating obstacle terrains on Surathkal beach. Hardware kits provided.',
 'Tech', 'state', 'LHC C Seminar Complex & Beach Arena, NITK', 'Surathkal',
 NOW() + INTERVAL '18 days', NOW() + INTERVAL '20 days', 120, NOW() + INTERVAL '15 days',
 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80', 'approved')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED COMMUNITIES
INSERT INTO public.communities (id, name, description, category, icon_url, created_by, status) VALUES
('d0000000-0000-0000-0000-000000000001', 'Computer Science & Coding Guild', 'Daily problem solving, LeetCode discussions, open source collaboration, and tech interview tips for CS/IS students.', 'Tech', 'Code2', 'a0000000-0000-0000-0000-000000000003', 'approved'),
('d0000000-0000-0000-0000-000000000002', 'Karnataka Students Network', 'Inter-campus student hub connecting VVCE, RVCE, BMSCE, PES, MSRIT, and NITK for accommodation, city guides, and state events.', 'Clubs', 'Globe', 'a0000000-0000-0000-0000-000000000001', 'approved'),
('d0000000-0000-0000-0000-000000000003', 'Robotics, IoT & Hardware Hackers', 'Circuits, Arduino, ROS, drones, Formula Student builds, and hardware troubleshooting for ECE and Mech creators.', 'Tech', 'Cpu', 'a0000000-0000-0000-0000-000000000006', 'approved'),
('d0000000-0000-0000-0000-000000000004', 'GATE & Higher Studies Aspirants', 'Subject notes, previous years question papers, mock tests, and test-taking strategies for GATE CS/EC/ME and MS abroad.', 'Academics', 'GraduationCap', 'a0000000-0000-0000-0000-000000000004', 'approved'),
('d0000000-0000-0000-0000-000000000005', 'Design, Product & UI/UX Guild', 'Critique sessions, Figma wireframing, case study breakdowns, and portfolio reviews for campus product designers.', 'Clubs', 'Palette', 'a0000000-0000-0000-0000-000000000008', 'approved'),
('d0000000-0000-0000-0000-000000000006', 'Kannada Sahitya & Samskruthi Sangha', 'Celebrating Kannada literature, poetry, Yakshagana, theatre, and heritage across engineering colleges in Karnataka.', 'Cultural', 'Sparkles', 'a0000000-0000-0000-0000-000000000001', 'approved'),
('d0000000-0000-0000-0000-000000000007', 'Campus Placement & Internship Prep', 'Aptitude shortcuts, coding rounds, referral threads, and mock interview practice for Tier-1 placements.', 'Career', 'Briefcase', 'a0000000-0000-0000-0000-000000000010', 'approved'),
('d0000000-0000-0000-0000-000000000008', 'Inter-College Sports & Esports', 'Football, cricket, badminton tournaments, and Valorant/BGMI inter-college scrims across Karnataka campuses.', 'Sports', 'Trophy', 'a0000000-0000-0000-0000-000000000009', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Community Memberships for Demo Student
INSERT INTO public.community_members (community_id, user_id, role) VALUES
('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'member'),
('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'admin'),
('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'admin')
ON CONFLICT DO NOTHING;

-- 7. SEED PROJECTS
INSERT INTO public.projects (
    id, owner_id, title, description, skills, tags, team_size, hackathon_url, status
) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
 'AI-Based Waste Sorting & Recycling for College Campuses',
 'Developing a real-time computer vision system using Raspberry Pi and edge cameras to automatically categorize cafeteria trash into compost, recyclable plastic, and dry waste with student reward points.',
 ARRAY['Computer Vision', 'PyTorch', 'IoT', 'FastAPI', 'Next.js'], ARRAY['AI', 'IoT', 'Sustainability'], 4,
 'https://karnatakahackathon2025.in', 'active'),

('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000006',
 'AgriTech Drone Monitoring for Farmers in Mandya & Mysuru',
 'Autonomous quadcopter mapping multispectral crop health indices (NDVI) to detect early blight in sugarcane and paddy crops, sending SMS alerts to local farmers in Kannada.',
 ARRAY['Embedded C', 'Drone PX4', 'Computer Vision', 'Python'], ARRAY['AgriTech', 'Drones', 'Social Impact'], 4,
 NULL, 'active'),

('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000008',
 'VTU Smart Grade & Attendance Predictor Mobile App',
 'A lightweight Flutter application that calculates SGPA/CGPA across VTU schemes, sends lecture bunk margin alerts, and analyzes past year question frequency trends.',
 ARRAY['Flutter', 'Dart', 'Firebase', 'Figma UI'], ARRAY['Mobile', 'EdTech', 'Productivity'], 3,
 NULL, 'active')
ON CONFLICT (id) DO NOTHING;

-- 8. SEED NOTIFICATIONS FOR DEMO STUDENT
INSERT INTO public.notifications (user_id, type, payload, is_read) VALUES
('a0000000-0000-0000-0000-000000000001', 'registration_confirmed', '{"event_title": "Karnataka Student Hackathon 2025", "venue": "VVCE Mysuru"}'::jsonb, false),
('a0000000-0000-0000-0000-000000000001', 'booking_accepted', '{"tutor_name": "Rohan Kumar", "subject": "Data Structures & Algorithms", "time": "Mon 6:00 PM"}'::jsonb, false),
('a0000000-0000-0000-0000-000000000001', 'post_like', '{"user_name": "Aishwarya M", "community": "Computer Science & Coding Guild"}'::jsonb, true);
