import { useRef, useState } from 'react';
import type { Milestone } from '../lib/types';
import {
  calendarDaysBetween,
  formatDayMonth,
  isValidDateString,
  relativeDayLabel,
} from '../lib/time';
import { useStore } from '../state/Store';
import { CameraIcon, CloseIcon, EditIcon, PlusIcon, StarIcon, TrashIcon } from './Icons';
import { Modal } from './Modal';
import { SectionHeading } from './SectionHeading';
import { StoredImage } from './StoredImage';

interface FormState {
  title: string;
  date: string;
  description: string;
  special: boolean;
  photoId: string | null;
}

export function Timeline() {
  const {
    milestones,
    today,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    saveMilestonePhoto,
    discardPhoto,
    confirmAction,
    notify,
  } = useStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [form, setForm] = useState<FormState>({
    title: '',
    date: today,
    description: '',
    special: false,
    photoId: null,
  });
  const [error, setError] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', date: today, description: '', special: false, photoId: null });
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (milestone: Milestone) => {
    setEditing(milestone);
    setForm({
      title: milestone.title,
      date: milestone.date,
      description: milestone.description,
      special: milestone.special,
      photoId: milestone.photoId,
    });
    setError('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setError('');
  };

  const choosePhoto = async (file: File | undefined, input: HTMLInputElement) => {
    if (!file) return;
    setPhotoBusy(true);
    try {
      const id = await saveMilestonePhoto(file);
      const previous = form.photoId;
      setForm((current) => ({ ...current, photoId: id }));
      if (previous) await discardPhoto(previous);
    } catch (uploadError) {
      notify(
        uploadError instanceof Error ? uploadError.message : 'That photograph could not be saved.',
        'error',
      );
    } finally {
      setPhotoBusy(false);
      input.value = '';
    }
  };

  const removePhoto = async () => {
    const current = form.photoId;
    setForm((state) => ({ ...state, photoId: null }));
    if (current) await discardPhoto(current);
  };

  const save = async () => {
    const title = form.title.trim();
    if (!title) {
      setError('Give this milestone a title.');
      return;
    }
    if (!isValidDateString(form.date)) {
      setError('Choose a valid date for this milestone.');
      return;
    }
    const payload = {
      title,
      date: form.date,
      description: form.description.trim(),
      special: form.special,
      photoId: form.photoId,
    };
    if (editing) {
      await updateMilestone(editing.id, payload);
      notify('Milestone updated.');
    } else {
      addMilestone(payload);
      notify('A new milestone has been added to her story.');
    }
    closeDialog();
  };

  const remove = async (milestone: Milestone) => {
    const confirmed = await confirmAction({
      title: 'Remove this milestone?',
      message: milestone.auto
        ? `“${milestone.title}” will be hidden from her timeline. You can bring the automatic milestone back by resetting the house in settings.`
        : `“${milestone.title}” will be removed from her story${milestone.photoId ? ', along with the photograph attached to it' : ''}. This cannot be undone.`,
      confirmLabel: 'Remove milestone',
      danger: true,
    });
    if (!confirmed) return;
    await deleteMilestone(milestone.id);
    notify('Milestone removed.');
  };

  return (
    <section id="adventures" className="section timeline-section" aria-labelledby="adventures-title">
      <div className="container">
        <SectionHeading
          eyebrow="Her Little Adventures"
          title="A little life in small chapters"
          id="adventures-title"
          lede="Her weeks, months and birthdays arrive here on their own. Add your own memories between them, with photographs and the things you want to remember."
          action={
            <button type="button" className="btn btn--primary" onClick={openAdd}>
              <PlusIcon className="icon" />
              Add a milestone
            </button>
          }
        />

        <ol className="timeline">
          {milestones.map((milestone) => {
            const parts = formatDayMonth(milestone.date);
            const diff = calendarDaysBetween(today, milestone.date);
            const status = diff === 0 ? 'today' : diff > 0 ? 'future' : 'past';
            return (
              <li key={milestone.id} className={`timeline__item timeline__item--${status}`}>
                <div className="timeline__rail" aria-hidden="true">
                  <span className={`timeline__marker${milestone.special ? ' timeline__marker--special' : ''}`}>
                    {milestone.special ? <StarIcon filled /> : <span className="timeline__dot" />}
                  </span>
                </div>

                <div className="timeline__date">
                  <span className="timeline__day">{parts.day}</span>
                  <span className="timeline__month">{parts.month}</span>
                  <span className="timeline__year">{parts.year}</span>
                </div>

                <article className="timeline__card">
                  <div className="timeline__card-head">
                    <h3 className="timeline__title">
                      {milestone.special ? <StarIcon className="timeline__title-star" filled /> : null}
                      {milestone.title}
                    </h3>
                    <div className="timeline__badges">
                      {status === 'future' ? <span className="badge badge--future">Upcoming</span> : null}
                      {status === 'today' ? <span className="badge badge--today">Today</span> : null}
                      {milestone.auto ? <span className="badge badge--auto">auto</span> : null}
                    </div>
                  </div>

                  {milestone.description ? (
                    <p className="timeline__description">{milestone.description}</p>
                  ) : null}

                  {milestone.photoId ? (
                    <div className="timeline__photo-wrap">
                      <StoredImage
                        photoId={milestone.photoId}
                        alt={`A memory for ${milestone.title}`}
                        className="timeline__photo"
                      />
                    </div>
                  ) : null}

                  <div className="timeline__foot">
                    <span className="timeline__relative">{relativeDayLabel(milestone.date, today)}</span>
                    <div className="timeline__actions">
                      <button type="button" className="mini-btn" onClick={() => openEdit(milestone)}>
                        <EditIcon />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="mini-btn mini-btn--danger"
                        onClick={() => remove(milestone)}
                      >
                        <TrashIcon />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>

        <p className="timeline__note">
          Milestones marked <span className="badge badge--auto">auto</span> are generated from her
          birth date. Every one of them can be edited, illustrated with a photograph, or removed.
        </p>
      </div>

      <Modal
        open={dialogOpen}
        onClose={closeDialog}
        title={editing ? 'Edit this milestone' : 'Add a milestone'}
        eyebrow="Her Little Adventures"
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={closeDialog}>
              Cancel
            </button>
            <button type="button" className="btn btn--primary" onClick={save} disabled={photoBusy}>
              {editing ? 'Save milestone' : 'Add to her story'}
            </button>
          </>
        }
      >
        <div className="form">
          <label className="field">
            <span className="field__label">Title</span>
            <input
              className="field__input"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="The day she discovered the ferns"
              maxLength={90}
              data-autofocus
            />
          </label>

          <div className="form__row">
            <label className="field">
              <span className="field__label">Date</span>
              <input
                className="field__input"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </label>
            <label className="field field--check">
              <input
                type="checkbox"
                checked={form.special}
                onChange={(event) => setForm({ ...form, special: event.target.checked })}
              />
              <span>
                Mark as a special memory
                <small>Adds a small star to her timeline.</small>
              </span>
            </label>
          </div>

          <label className="field">
            <span className="field__label">Description</span>
            <textarea
              className="field__input field__input--area"
              rows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="What happened, how she seemed, what the light was like…"
              maxLength={600}
            />
          </label>

          <div className="field">
            <span className="field__label">Photograph</span>
            {form.photoId ? (
              <div className="photo-attach">
                <StoredImage photoId={form.photoId} alt="Attached milestone photograph" className="photo-attach__image" />
                <button type="button" className="mini-btn mini-btn--danger" onClick={removePhoto}>
                  <CloseIcon />
                  Remove photograph
                </button>
              </div>
            ) : (
              <div className="photo-attach photo-attach--empty">
                <CameraIcon className="photo-attach__icon" />
                <p>One photograph, if you have one.</p>
                <button
                  type="button"
                  className="btn btn--soft"
                  onClick={() => fileInput.current?.click()}
                  disabled={photoBusy}
                >
                  {photoBusy ? 'Preparing…' : 'Choose photograph'}
                </button>
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => choosePhoto(event.target.files?.[0], event.currentTarget)}
            />
          </div>

          {error ? (
            <p className="form__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </Modal>
    </section>
  );
}
