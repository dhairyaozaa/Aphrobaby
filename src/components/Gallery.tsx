import { useEffect, useMemo, useRef, useState } from 'react';
import type { PhotoMeta } from '../lib/types';
import { CATEGORIES } from '../lib/types';
import { formatDateShort, isValidDateString } from '../lib/time';
import { useStore } from '../state/Store';
import {
  CameraIcon,
  CloseIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from './Icons';
import { Lightbox } from './Lightbox';
import { Modal } from './Modal';
import { PhotoView } from './PhotoView';
import { SectionHeading } from './SectionHeading';

export function Gallery() {
  const { photos, today, addPhotos, updatePhoto, deletePhoto, confirmAction, notify } = useStore();
  const [filter, setFilter] = useState<string>('All');
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [queue, setQueue] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadCategory, setUploadCategory] = useState<string>(CATEGORIES[0]);
  const [uploadDate, setUploadDate] = useState(today);
  const [uploadError, setUploadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<PhotoMeta | null>(null);
  const [editForm, setEditForm] = useState({
    caption: '',
    date: today,
    category: CATEGORIES[0] as string,
    note: '',
  });
  const [editError, setEditError] = useState('');

  useEffect(() => {
    const urls = queue.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [queue]);

  useEffect(() => {
    if (!editing) return;
    setEditForm({
      caption: editing.caption,
      date: editing.date,
      category: editing.category,
      note: editing.note,
    });
    setEditError('');
  }, [editing]);

  useEffect(() => {
    if (!uploadOpen) return;
    setUploadDate(today);
  }, [uploadOpen, today]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    photos.forEach((photo) => map.set(photo.category, (map.get(photo.category) ?? 0) + 1));
    return map;
  }, [photos]);

  const filtered = useMemo(
    () => (filter === 'All' ? photos : photos.filter((photo) => photo.category === filter)),
    [photos, filter],
  );

  const lightboxIndex = filtered.findIndex((photo) => photo.id === lightboxId);

  const openUpload = () => {
    setQueue([]);
    setUploadError('');
    setUploadCategory(filter === 'All' ? CATEGORIES[0] : filter);
    setUploadDate(today);
    setUploadOpen(true);
  };

  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const images = Array.from(incoming).filter((file) => file.type.startsWith('image/'));
    const rejected = Array.from(incoming).length - images.length;
    if (rejected > 0) {
      notify(`${rejected} file${rejected === 1 ? ' was' : 's were'} skipped — only images can join her diary.`, 'error');
    }
    if (images.length) {
      setQueue((current) => [...current, ...images].slice(0, 24));
      setUploadError('');
    }
  };

  const submitUpload = async () => {
    if (!queue.length) {
      setUploadError('Choose at least one photograph first.');
      return;
    }
    setBusy(true);
    setUploadError('');
    try {
      const result = await addPhotos(queue, uploadCategory, uploadDate);
      if (result.added > 0) {
        notify(`${result.added} photograph${result.added === 1 ? '' : 's'} added to her diary.`);
      }
      if (result.failed.length > 0) {
        notify(result.failed[0], 'error');
      }
      if (result.added > 0) {
        setUploadOpen(false);
        setQueue([]);
      }
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = () => {
    if (!editing) return;
    if (!isValidDateString(editForm.date)) {
      setEditError('Choose a valid date for this photograph.');
      return;
    }
    updatePhoto(editing.id, {
      caption: editForm.caption.trim(),
      date: editForm.date,
      category: editForm.category,
      note: editForm.note.trim(),
    });
    notify('Photograph updated.');
    setEditing(null);
  };

  const removePhoto = async (photo: PhotoMeta) => {
    const confirmed = await confirmAction({
      title: 'Remove this photograph?',
      message: `“${photo.caption || 'Untitled moment'}” will be deleted from her diary, along with its caption and note. This cannot be undone.`,
      confirmLabel: 'Delete photograph',
      danger: true,
    });
    if (!confirmed) return;
    await deletePhoto(photo.id);
    if (lightboxId === photo.id) setLightboxId(null);
    notify('Photograph removed from her diary.');
  };

  const openEdit = (photo: PhotoMeta) => {
    setEditing(photo);
  };

  return (
    <section id="diary" className="section gallery-section" aria-labelledby="diary-title">
      <div className="container">
        <SectionHeading
          eyebrow="Aphrodite's Diary"
          title="Her photographed days"
          id="diary-title"
          lede="A scrapbook of the ordinary and the once-only. Add photographs, write what you remember, and keep the small days from slipping away."
          action={
            <button type="button" className="btn btn--primary" onClick={openUpload}>
              <CameraIcon className="icon" />
              Add photographs
            </button>
          }
        />

        <div className="gallery__toolbar">
          <div className="chips" role="group" aria-label="Filter photographs by album">
            <button
              type="button"
              className={`chip${filter === 'All' ? ' is-active' : ''}`}
              onClick={() => {
                setFilter('All');
                setLightboxId(null);
              }}
            >
              All <span className="chip__count">{photos.length}</span>
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`chip${filter === category ? ' is-active' : ''}`}
                onClick={() => {
                  setFilter(category);
                  setLightboxId(null);
                }}
              >
                {category} <span className="chip__count">{counts.get(category) ?? 0}</span>
              </button>
            ))}
          </div>
          <p className="gallery__count">
            {filtered.length} {filtered.length === 1 ? 'photograph' : 'photographs'}
            {filter !== 'All' ? ` in ${filter}` : ''}
          </p>
        </div>

        {filtered.length ? (
          <div className="gallery__masonry">
            {filtered.map((photo) => (
              <figure className="photo-card" key={photo.id}>
                <button
                  type="button"
                  className="photo-card__open"
                  onClick={() => setLightboxId(photo.id)}
                  aria-label={`View ${photo.caption || 'photograph'} larger`}
                >
                  <span
                    className="photo-card__media"
                    style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
                  >
                    <PhotoView photo={photo} className="photo-card__image" />
                  </span>
                  <span className="photo-card__caption">
                    <span className="photo-card__caption-text">{photo.caption || 'Untitled moment'}</span>
                    <span className="photo-card__meta">
                      {formatDateShort(photo.date)} <span aria-hidden="true">·</span> {photo.category}
                    </span>
                  </span>
                  {photo.id.startsWith('plate-') ? (
                    <span className="photo-card__flag">Illustration</span>
                  ) : null}
                </button>
                <div className="photo-card__tools">
                  <button
                    type="button"
                    className="photo-card__tool"
                    onClick={() => openEdit(photo)}
                    aria-label={`Edit ${photo.caption || 'photograph'}`}
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="photo-card__tool photo-card__tool--danger"
                    onClick={() => removePhoto(photo)}
                    aria-label={`Delete ${photo.caption || 'photograph'}`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </figure>
            ))}
          </div>
        ) : (
          <div className="gallery__empty">
            <CameraIcon className="gallery__empty-icon" />
            <h3>No photographs here yet</h3>
            <p>
              {filter === 'All'
                ? 'Her diary is waiting for its first real day. Add a photograph and it will stay in this browser, kept safe for her.'
                : `Nothing filed under ${filter} yet. Add a photograph to begin this album.`}
            </p>
            <button type="button" className="btn btn--primary" onClick={openUpload}>
              <PlusIcon className="icon" />
              Add the first photograph
            </button>
          </div>
        )}

        <p className="gallery__footnote">
          Photographs are optimised and kept privately in this browser. They are never uploaded
          anywhere.
        </p>
      </div>

      <Modal
        open={uploadOpen}
        onClose={() => (busy ? undefined : setUploadOpen(false))}
        title="Add to her diary"
        eyebrow="Aphrodite's Diary"
        size="wide"
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setUploadOpen(false)} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={submitUpload} disabled={busy || !queue.length}>
              <UploadIcon className="icon" />
              {busy ? 'Tucking them away…' : `Add ${queue.length || ''} photograph${queue.length === 1 ? '' : 's'}`}
            </button>
          </>
        }
      >
        <div className="form">
          <div
            className={`dropzone${dragging ? ' is-dragging' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <CameraIcon className="dropzone__icon" />
            <p className="dropzone__title">Drop photographs here</p>
            <p className="dropzone__note">or choose them from your device &mdash; JPG, PNG, WebP or HEIC</p>
            <button type="button" className="btn btn--soft" onClick={() => fileInput.current?.click()}>
              Choose photographs
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = '';
              }}
            />
          </div>

          {queue.length ? (
            <ul className="queue">
              {queue.map((file, index) => (
                <li className="queue__item" key={`${file.name}-${file.size}-${index}`}>
                  {previews[index] ? (
                    <img src={previews[index]} alt="" className="queue__thumb" />
                  ) : (
                    <span className="queue__thumb" />
                  )}
                  <span className="queue__name">{file.name}</span>
                  <button
                    type="button"
                    className="queue__remove"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => setQueue((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    <CloseIcon />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="form__row">
            <label className="field">
              <span className="field__label">Album</span>
              <select
                className="field__input"
                value={uploadCategory}
                onChange={(event) => setUploadCategory(event.target.value)}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Date</span>
              <input
                className="field__input"
                type="date"
                value={uploadDate}
                onChange={(event) => setUploadDate(event.target.value)}
              />
            </label>
          </div>

          {uploadError ? (
            <p className="form__error" role="alert">
              {uploadError}
            </p>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit this photograph"
        eyebrow="Aphrodite's Diary"
        footer={
          <>
            <button
              type="button"
              className="btn btn--danger-quiet"
              onClick={() => {
                const photo = editing;
                setEditing(null);
                if (photo) void removePhoto(photo);
              }}
            >
              <TrashIcon className="icon" />
              Delete
            </button>
            <span className="modal__spacer" />
            <button type="button" className="btn btn--ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={saveEdit} data-autofocus>
              Save photograph
            </button>
          </>
        }
      >
        {editing ? (
          <div className="form">
            <div className="edit-preview">
              <PhotoView photo={editing} className="edit-preview__image" loading="eager" />
            </div>
            <label className="field">
              <span className="field__label">Caption</span>
              <input
                className="field__input"
                value={editForm.caption}
                maxLength={120}
                placeholder="What was happening here?"
                onChange={(event) => setEditForm({ ...editForm, caption: event.target.value })}
              />
            </label>
            <div className="form__row">
              <label className="field">
                <span className="field__label">Album</span>
                <select
                  className="field__input"
                  value={editForm.category}
                  onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">Date</span>
                <input
                  className="field__input"
                  type="date"
                  value={editForm.date}
                  onChange={(event) => setEditForm({ ...editForm, date: event.target.value })}
                />
              </label>
            </div>
            <label className="field">
              <span className="field__label">Personal note</span>
              <textarea
                className="field__input field__input--area"
                rows={3}
                maxLength={600}
                value={editForm.note}
                placeholder="The small detail you never want to forget…"
                onChange={(event) => setEditForm({ ...editForm, note: event.target.value })}
              />
            </label>
            {editError ? (
              <p className="form__error" role="alert">
                {editError}
              </p>
            ) : null}
          </div>
        ) : null}
      </Modal>

      {lightboxIndex >= 0 ? (
        <Lightbox
          photos={filtered}
          index={lightboxIndex}
          onClose={() => setLightboxId(null)}
          onNavigate={(next) => setLightboxId(filtered[next]?.id ?? null)}
        />
      ) : null}
    </section>
  );
}
