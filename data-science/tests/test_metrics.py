from evaluation.metrics import ndcg_at_k, precision_at_k, recall_at_k, reciprocal_rank


def test_precision_and_recall_at_k() -> None:
    ranking = ["b", "a", "c"]
    relevant = {"a", "c"}
    assert precision_at_k(ranking, relevant, 2) == 0.5
    assert recall_at_k(ranking, relevant, 2) == 0.5


def test_reciprocal_rank_and_ndcg() -> None:
    ranking = ["b", "a", "c"]
    relevant = {"a"}
    assert reciprocal_rank(ranking, relevant) == 0.5
    assert ndcg_at_k(ranking, relevant, 3) == 1 / 1.584962500721156


def test_empty_relevance_is_defined_as_zero() -> None:
    assert recall_at_k(["a"], set(), 1) == 0.0
    assert reciprocal_rank(["a"], set()) == 0.0
    assert ndcg_at_k(["a"], set(), 1) == 0.0


def test_metrics_are_deterministic() -> None:
    arguments = (["a", "b", "c"], {"b"}, 3)
    first = (precision_at_k(*arguments), recall_at_k(*arguments), ndcg_at_k(*arguments))
    second = (precision_at_k(*arguments), recall_at_k(*arguments), ndcg_at_k(*arguments))
    assert first == second
