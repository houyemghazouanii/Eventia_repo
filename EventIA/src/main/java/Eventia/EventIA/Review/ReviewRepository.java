package Eventia.EventIA.Review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByEventId(Long eventId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.event.id = :eventId")
    Double findAverageRatingByEvent(@Param("eventId") Long eventId);

    boolean existsByParticipantIdAndEventId(Long participantId, Long eventId);
    List<Review> findByParticipantId(Long userId);

}

