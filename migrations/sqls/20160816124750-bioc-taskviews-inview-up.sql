
ALTER TABLE TaskViews ADD `in_view` INT(11) DEFAULT NULL;

ALTER TABLE TaskViews ADD CONSTRAINT `TaskViews_ibfk_2` FOREIGN KEY (`in_view`)
            REFERENCES `TaskViews` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;