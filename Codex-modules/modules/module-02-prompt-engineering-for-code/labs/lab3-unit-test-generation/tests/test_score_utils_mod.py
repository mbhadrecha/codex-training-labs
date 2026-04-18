import pytest

from src.score_utils import calculate_final_score, is_eligible_for_reward


def test_calculate_final_score_applies_bonus_and_penalty():
    result = calculate_final_score(base_score=80, bonus_pct=25, penalty=5)
    assert result == pytest.approx(95.0)


def test_calculate_final_score_rounds_to_two_decimals():
    result = calculate_final_score(base_score=81, bonus_pct=17.5, penalty=3.2)
    assert result == pytest.approx(91.98)


def test_calculate_final_score_returns_base_score_when_bonus_and_penalty_are_zero():
    result = calculate_final_score(base_score=50, bonus_pct=0, penalty=0)
    assert result == pytest.approx(50.0)


def test_calculate_final_score_subtracts_penalty_when_bonus_is_zero():
    result = calculate_final_score(base_score=50, bonus_pct=0, penalty=7.5)
    assert result == pytest.approx(42.5)


def test_calculate_final_score_handles_another_bonus_and_penalty_mix():
    result = calculate_final_score(base_score=64.4, bonus_pct=12.5, penalty=1.23)
    assert result == pytest.approx(71.22)


def test_is_eligible_for_reward_accepts_score_at_default_threshold():
    assert is_eligible_for_reward(score=75.0)


def test_is_eligible_for_reward_rejects_score_below_default_threshold():
    assert not is_eligible_for_reward(score=74.999)


def test_is_eligible_for_reward_accepts_score_equal_to_custom_threshold():
    assert is_eligible_for_reward(score=90, threshold=90)


def test_is_eligible_for_reward_rejects_score_below_custom_threshold():
    assert not is_eligible_for_reward(score=89.99, threshold=90)
