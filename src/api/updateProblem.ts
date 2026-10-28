import { useMutation } from '@tanstack/react-query';
import type { Problem, UpdateProblemData } from '@/types/problem';
import { runGas } from '@/lib/gas';
import { PROBLEMS_QUERY_KEY } from './queryKeys';

const applyProblemUpdate = (
  problems: Problem[],
  { rowNumber, action }: UpdateProblemData,
): Problem[] => {
  if (action === 'Finish') {
    return problems.filter((problem) => problem.rowNumber !== rowNumber);
  }

  return problems.map((problem) =>
    problem.rowNumber === rowNumber
      ? { ...problem, start: 'Memuat...' }
      : problem,
  );
};

export const useUpdateProblem = () => {
  return useMutation({
    mutationFn: ({ rowNumber, action }: UpdateProblemData) => {
      return runGas('updateProblem', { rowNumber, action });
    },
    onSuccess: (_data, variables, _onMutateResult, context) => {
      context.client.setQueryData(
        PROBLEMS_QUERY_KEY,
        (oldProblems: Problem[] | undefined) =>
          oldProblems
            ? applyProblemUpdate(oldProblems, variables)
            : oldProblems,
      );
    },
    onSettled: (_data, _error, _variables, _onMutateResult, context) => {
      // Sengaja tidak di-await/return: kalau promise-nya di-await, mutation
      // (dan toast success) baru selesai setelah refetch getProblems selesai.
      void context.client.invalidateQueries({ queryKey: PROBLEMS_QUERY_KEY });
    },
  });
};
