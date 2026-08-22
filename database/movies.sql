use cinerush;
SELECT * FROM cinerush.movies;
INSERT INTO movies (id, title, description, duration, release_date, created_at, status, poster_url)
VALUES
(1, 'Coolie', 'Coolie revolves around Deva, a mysterious man who stands up against a corrupt syndicate exploiting and abusing the coolies in a coastal port town.', 148, '2025-08-15', NOW(), 'active', '/assets/coolie.png'),
(2, 'Mirai', 'Mirai is a fantasy action-adventure film that intertwines Indian mythology with modern storytelling, following a young warrior named Veda on his quest to protect sacred scriptures from dark forces.', 148, '2025-09-12', NOW(), 'active', '/assets/mirai.png');
SELECT * FROM cinerush.movies;