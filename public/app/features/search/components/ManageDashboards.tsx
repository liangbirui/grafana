import React, { FC, useState } from 'react';
import { contextSrv } from 'app/core/services/context_srv';
import { css } from 'emotion';
import { Icon, TagList, HorizontalGroup, stylesFactory, useTheme } from '@grafana/ui';
import { GrafanaTheme } from '@grafana/data';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { MoveToFolderModal } from './MoveToFolderModal';
import { useSearchQuery } from '../hooks/useSearchQuery';
import { useManageDashboards } from '../hooks/useManageDashboards';
import { SearchResultsFilter } from './SearchResultsFilter';
import { SearchResults } from './SearchResults';
import { DashboardActions } from './DashboardActions';
import { SearchField } from './SearchField';

export interface Props {
  folderId?: number;
  folderUid?: string;
}

const { isEditor } = contextSrv;

export const ManageDashboards: FC<Props> = ({ folderId, folderUid }) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const queryParams = { skipRecent: true, skipStarred: true, folderIds: folderId ? [folderId] : [] };
  const {
    query,
    hasFilters,
    onQueryChange,
    onRemoveStarred,
    onTagRemove,
    onClearFilters,
    onTagFilterChange,
    onStarredFilterChange,
    onTagAdd,
  } = useSearchQuery(queryParams);

  const {
    results,
    loading,
    canSave,
    allChecked,
    hasEditPermissionInFolders,
    canMove,
    canDelete,
    onToggleSection,
    onToggleChecked,
    onToggleAllChecked,
    onDeleteItems,
    onMoveItems,
  } = useManageDashboards(query, { hasEditPermissionInFolders: contextSrv.hasEditPermissionInFolders });

  const onMoveTo = () => {
    setIsMoveModalOpen(true);
  };

  const onItemDelete = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="dashboard-list">
      <HorizontalGroup justify="space-between">
        <SearchField query={query} onChange={onQueryChange} className={styles.searchField} />
        <DashboardActions isEditor={isEditor} canEdit={hasEditPermissionInFolders || canSave} folderId={folderId} />
      </HorizontalGroup>

      {hasFilters && (
        <HorizontalGroup>
          <div className="gf-form-inline">
            {query.tag.length > 0 && (
              <div className="gf-form">
                <label className="gf-form-label width-4">Tags</label>
                <TagList tags={query.tag} onClick={onTagRemove} />
              </div>
            )}
            {query.starred && (
              <div className="gf-form">
                <label className="gf-form-label">
                  <a className="pointer" onClick={onRemoveStarred}>
                    <Icon name="check" />
                    Starred
                  </a>
                </label>
              </div>
            )}
            <div className="gf-form">
              <label className="gf-form-label">
                <a className="pointer" onClick={onClearFilters}>
                  <Icon name="times" />
                  &nbsp;Clear
                </a>
              </label>
            </div>
          </div>
        </HorizontalGroup>
      )}

      <div className="search-results">
        <SearchResultsFilter
          allChecked={allChecked}
          canDelete={canDelete}
          canMove={canMove}
          deleteItem={onItemDelete}
          moveTo={onMoveTo}
          onToggleAllChecked={onToggleAllChecked}
          onStarredFilterChange={onStarredFilterChange}
          onTagFilterChange={onTagFilterChange}
          selectedStarredFilter={query.starred}
          selectedTagFilter={query.tag}
        />
        <div className="search-results-container">
          <SearchResults
            loading={loading}
            results={results}
            editable
            onTagSelected={onTagAdd}
            onToggleSection={onToggleSection}
            onToggleChecked={onToggleChecked}
          />
        </div>
      </div>
      <ConfirmDeleteModal
        onDeleteItems={onDeleteItems}
        results={results}
        isOpen={isDeleteModalOpen}
        onDismiss={() => setIsDeleteModalOpen(false)}
      />
      <MoveToFolderModal
        onMoveItems={onMoveItems}
        results={results}
        isOpen={isMoveModalOpen}
        onDismiss={() => setIsMoveModalOpen(false)}
      />
    </div>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    searchField: css`
      padding: 0;
      margin: 0;
      width: 400px;
    `,
  };
});
