from rest_framework import serializers
from ranking.models import PlayerScore
from .base import BaseModelSerializer


class PlayerScoreSerializer(BaseModelSerializer):
    """
    Serializador para el modelo PlayerScore.
    """
    
    player_email = serializers.CharField(source='player.email', read_only=True)
    player_username = serializers.CharField(source='player.user_name', read_only=True)
    rank = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = PlayerScore
        fields = [
            'id', 'player', 'player_email', 'player_username',
            'total_points', 'games_completed', 'last_updated', 'rank'
        ]
        read_only_fields = ['id', 'last_updated', 'player_email', 'player_username', 'rank']
    
    def validate_total_points(self, value):
        """Valida que los puntos totales no sean negativos."""
        return self.validate_positive_integer(value, "Puntos totales")
    
    def validate_games_completed(self, value):
        """Valida que los juegos completados no sean negativos."""
        return self.validate_positive_integer(value, "Juegos completados")


class PlayerScoreCreateUpdateSerializer(BaseModelSerializer):
    """
    Serializador para crear y actualizar PlayerScore.
    """
    
    class Meta:
        model = PlayerScore
        fields = ['player', 'total_points', 'games_completed']
    
    def validate_total_points(self, value):
        """Valida que los puntos totales no sean negativos."""
        if value < 0:
            raise serializers.ValidationError("Los puntos totales no pueden ser negativos.")
        return value
    
    def validate_games_completed(self, value):
        """Valida que los juegos completados no sean negativos."""
        if value < 0:
            raise serializers.ValidationError("Los juegos completados no pueden ser negativos.")
        return value


class LeaderboardSerializer(serializers.Serializer):
    """
    Serializador para el leaderboard.
    """
    
    rank = serializers.IntegerField()
    player_email = serializers.CharField(source='player.email')
    player_username = serializers.CharField(source='player.user_name', allow_null=True)
    total_points = serializers.IntegerField()
    games_completed = serializers.IntegerField()
